<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">🔍 {{ p.heading }}</h1>
    <p class="text-slate-400 mb-6">{{ p.description }}</p>

    <!-- 3D Viewport -->
    <div
      class="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900"
    >
      <div ref="canvasContainer" class="w-full h-[500px]"></div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-slate-900/80"
      >
        <div class="text-center">
          <div
            class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          ></div>
          <span class="text-slate-400 text-sm">載入模型中...</span>
        </div>
      </div>

      <!-- Controls Overlay -->
      <div
        class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 to-transparent"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-white font-semibold">{{ selectedItem?.name }}</h3>
            <p class="text-xs text-slate-400">
              材質狀態：{{ isColorMode ? "🎨 憶起色彩" : "🗿 原始石材" }}
            </p>
          </div>
          <button
            @click="toggleTexture"
            :disabled="isTransitioning"
            :class="[
              'px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300',
              isColorMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25',
              isTransitioning ? 'opacity-50 cursor-not-allowed' : '',
            ]"
          >
            {{ isColorMode ? "🗿 返回原色" : "✨ 喚醒記憶" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Story Card -->
    <div
      v-if="selectedItem"
      class="mt-6 p-5 rounded-2xl bg-slate-800/60 border border-slate-700"
    >
      <h3 class="text-lg font-semibold text-indigo-400 mb-2">傳說故事</h3>
      <p class="text-slate-300 leading-relaxed">{{ selectedItem.story }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useSiteData } from "../composables/useSiteData.js";

const { items, page } = useSiteData();
const p = computed(() => page("scanner"));

const canvasContainer = ref(null);
const selectedItem = ref(null);
const loading = ref(false);
const isColorMode = ref(false);
const isTransitioning = ref(false);

let scene, camera, renderer, controls, currentModel, animationId;
const originalMaterials = new Map();

function initScene() {
  const container = canvasContainer.value;
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 1.5, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0.8, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener("resize", onResize);
}

function onResize() {
  const container = canvasContainer.value;
  if (!container || !camera || !renderer) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function loadModel(item) {
  if (!scene) return;
  loading.value = true;
  isColorMode.value = false;
  originalMaterials.clear();

  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  const loader = new GLTFLoader();
  loader.load(
    item.model_url,
    (gltf) => {
      const model = gltf.scene;

      // Auto-scale & center
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      model.scale.setScalar(scale);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center.multiplyScalar(scale));
      model.position.y += size.y * scale * 0.5;

      // CRITICAL: Backup and then strip if it's the stone item
      model.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];
          originalMaterials.set(
            child.uuid,
            mats.map((m) => ({
              map: m.map ? m.map : null,
              color: m.color ? m.color.clone() : new THREE.Color(0xffffff),
              vertexColors: m.vertexColors,
              transparent: m.transparent,
              opacity: m.opacity,
            })),
          );

          // Force strip maps for stone item (id: 1) to reveal native look
          if (item.id === 1) {
            mats.forEach((m) => {
              m.map = null;
              m.needsUpdate = true;
            });
          }
        }
      });

      scene.add(model);
      currentModel = model;
      loading.value = false;
    },
    undefined,
    (err) => {
      console.error("Loader Error:", err);
      loading.value = false;
    },
  );
}

function restoreItems() {
  if (!currentModel) return;
  currentModel.traverse((child) => {
    if (child.isMesh) {
      const origs = originalMaterials.get(child.uuid) || [];
      const mats = Array.isArray(child.material)
        ? child.material
        : [child.material];
      mats.forEach((m, i) => {
        const o = origs[i];
        if (o) {
          // 如果是石板 (id: 1)，返回時強制去貼圖，而不是恢復 GLB 內嵌的彩色貼圖
          if (selectedItem.value && selectedItem.value.id === 1) {
            m.map = null;
          } else {
            m.map = o.map;
          }
          m.color.copy(o.color);
          m.vertexColors = o.vertexColors;
          m.transparent = o.transparent;
          m.opacity = o.opacity;
        }
        m.needsUpdate = true;
      });
    }
  });
}

async function toggleTexture() {
  if (!currentModel || isTransitioning.value) return;
  isTransitioning.value = true;

  const nextColor = !isColorMode.value;
  const texUrl = nextColor ? selectedItem.value?.color_texture : null;

  const runTransition = (midCallback) => {
    const duration = 800;
    const start = performance.now();
    let swapped = false;

    currentModel.traverse((c) => {
      if (c.isMesh) {
        const ms = Array.isArray(c.material) ? c.material : [c.material];
        ms.forEach((m) => (m.transparent = true));
      }
    });

    const anim = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      if (progress < 0.5) {
        currentModel.traverse((c) => {
          if (c.isMesh) {
            const ms = Array.isArray(c.material) ? c.material : [c.material];
            ms.forEach((m) => (m.opacity = 1 - ease * 2));
          }
        });
      } else {
        if (!swapped) {
          swapped = true;
          midCallback();
        }
        currentModel.traverse((c) => {
          if (c.isMesh) {
            const ms = Array.isArray(c.material) ? c.material : [c.material];
            ms.forEach((m) => (m.opacity = (ease - 0.5) * 2));
          }
        });
      }

      if (progress < 1) requestAnimationFrame(anim);
      else {
        currentModel.traverse((c) => {
          if (c.isMesh) {
            const ms = Array.isArray(c.material) ? c.material : [c.material];
            ms.forEach((m) => {
              m.opacity = 1;
              m.transparent = false;
            });
          }
        });
        isColorMode.value = nextColor;
        isTransitioning.value = false;
      }
    };
    requestAnimationFrame(anim);
  };

  if (nextColor && texUrl) {
    new THREE.TextureLoader().load(
      texUrl,
      (t) => {
        t.flipY = false;
        t.colorSpace = THREE.SRGBColorSpace;
        runTransition(() => {
          currentModel.traverse((c) => {
            if (c.isMesh) {
              const ms = Array.isArray(c.material) ? c.material : [c.material];
              ms.forEach((m) => {
                m.map = t;
                m.color.set(0xffffff);
                m.vertexColors = false;
                m.needsUpdate = true;
              });
            }
          });
        });
      },
      undefined,
      () => {
        isTransitioning.value = false;
      },
    );
  } else {
    runTransition(() => restoreItems());
  }
}

onMounted(() => {
  initScene();
  const st = items.value[0];
  if (st) {
    selectedItem.value = st;
    loadModel(st);
  }
});

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener("resize", onResize);
  if (renderer) renderer.dispose();
});
</script>
