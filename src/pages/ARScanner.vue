<template>
  <div>
    <!-- MindAR + A-Frame Scene — native fullscreen, no embedded -->
    <a-scene
      v-if="!arError && stoneItem"
      ref="aSceneEl"
      mindar-image="imageTargetSrc: /assets/targets.mind; autoStart: true; uiLoading: no; uiScanning: no; uiError: no; filterMinCF: 0.0001; filterBeta: 0.00001; warmupTolerance: 12; missTolerance: 6;"
      color-space="sRGB"
      renderer="colorManagement: true; antialias: true; alpha: true"
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false"
      loading-screen="enabled: false"
    >
      <a-assets>
        <a-asset-item
          id="stone-model"
          :src="stoneItem.model_url"
        ></a-asset-item>
      </a-assets>

      <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

      <a-entity ref="targetEntity" mindar-image-target="targetIndex: 0">
        <a-light type="ambient" intensity="0.6"></a-light>
        <a-light type="directional" intensity="1.2" position="5 10 7"></a-light>
        <a-gltf-model
          ref="modelEntity"
          src="#stone-model"
          position="0 0 0"
          scale="0.1 0.1 0.1"
        ></a-gltf-model>
      </a-entity>
    </a-scene>

    <!-- HUD overlay — fixed on top of fullscreen A-Frame -->
    <div v-if="!arError" class="ar-hud">
      <div
        class="ar-hud-topbar pointer-events-auto flex items-center justify-between p-4"
      >
        <router-link
          to="/"
          class="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm hover:bg-black/70 transition-colors"
        >
          ← 返回
        </router-link>
        <div
          class="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-sm"
        >
          <span v-if="!sessionReady" class="text-yellow-400"
            >📷 啟動 AR 引擎中…</span
          >
          <span
            v-else-if="tracking"
            class="text-green-400 flex items-center gap-1"
          >
            <span
              class="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"
            ></span>
            追蹤中：{{ stoneItem?.name }}
          </span>
          <span v-else class="text-slate-300">將石板對準畫面</span>
        </div>
      </div>

      <Transition name="slide-up">
        <div
          v-if="tracking"
          class="ar-hud-bottom pointer-events-auto absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-white font-bold text-lg">
                {{ stoneItem?.thumbnail }} {{ stoneItem?.name }}
              </h3>
              <p class="text-xs text-slate-400">
                材質：{{ isColorMode ? "🎨 已喚醒色彩" : "✨ 原始石材" }}
              </p>
            </div>
          </div>

          <button
            @click="toggleTexture"
            :disabled="isTransitioning"
            :class="[
              'w-full px-5 py-3 rounded-xl font-medium text-base transition-all duration-300',
              isColorMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25',
              isTransitioning ? 'opacity-50 cursor-not-allowed' : '',
            ]"
          >
            {{ isColorMode ? "🎨 回到原色" : "✨ 喚醒記憶" }}
          </button>

          <button
            @click="showStory = !showStory"
            class="w-full mt-3 text-left text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {{ showStory ? "▲ 收起故事" : "▼ 看這件物品的故事" }}
          </button>
          <Transition name="fade">
            <p
              v-if="showStory"
              class="mt-2 text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-lg"
            >
              {{ stoneItem?.story }}
            </p>
          </Transition>
        </div>
      </Transition>
    </div>

    <!-- Error screen -->
    <div
      v-if="arError"
      class="fixed inset-0 z-30 flex items-center justify-center bg-slate-900"
    >
      <div class="text-center p-8">
        <div class="text-5xl mb-4">📷</div>
        <h2 class="text-xl font-bold text-white mb-2">AR 功能無法啟動</h2>
        <p class="text-slate-400 mb-4">{{ arError }}</p>
        <router-link
          to="/"
          class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors inline-block"
        >
          返回首頁
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as THREE from "three";
import { useSiteData } from "../composables/useSiteData.js";

const { items } = useSiteData();
const stoneItem = ref(null);

const aSceneEl = ref(null);
const targetEntity = ref(null);
const modelEntity = ref(null);

const sessionReady = ref(false);
const tracking = ref(false);
const arError = ref(null);
const showStory = ref(false);

const isColorMode = ref(false);
const isTransitioning = ref(false);

let currentModel = null;
const originalMaterials = new Map();
let restoreGetUserMedia = null;

function preferRearCamera() {
  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices?.getUserMedia || restoreGetUserMedia) return;

  const originalGetUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
  restoreGetUserMedia = () => {
    mediaDevices.getUserMedia = originalGetUserMedia;
    restoreGetUserMedia = null;
  };

  mediaDevices.getUserMedia = async (constraints = {}) => {
    const baseVideo =
      typeof constraints.video === "object" ? constraints.video : {};
    const preferredConstraints = {
      ...constraints,
      audio: constraints.audio ?? false,
      video: {
        ...baseVideo,
        facingMode: { ideal: "environment" },
      },
    };

    try {
      return await originalGetUserMedia(preferredConstraints);
    } catch (err) {
      console.warn(
        "Rear camera preference unavailable, fallback to default stream.",
        err,
      );
      return originalGetUserMedia(constraints);
    }
  };
}

onMounted(async () => {
  preferRearCamera();
  stoneItem.value = items.value[0];

  await nextTick();
  const sceneEl = aSceneEl.value;
  if (!sceneEl) return;

  const onSceneReady = () => {
    sessionReady.value = true;
  };

  if (sceneEl.hasLoaded) {
    onSceneReady();
  } else {
    sceneEl.addEventListener("loaded", onSceneReady);
  }

  sceneEl.addEventListener("arReady", () => {
    sessionReady.value = true;
  });
  sceneEl.addEventListener("arError", () => {
    arError.value = "相機啟動失敗，請允許相機權限後重試。";
  });

  await nextTick();

  const tgtEl = targetEntity.value;
  if (tgtEl) {
    tgtEl.addEventListener("targetFound", () => {
      tracking.value = true;
    });
    tgtEl.addEventListener("targetLost", () => {
      tracking.value = false;
    });
  }

  const modelEl = modelEntity.value;
  if (modelEl) {
    modelEl.addEventListener("model-loaded", () => {
      const mesh = modelEl.getObject3D("mesh");
      if (!mesh) return;
      currentModel = mesh;
      originalMaterials.clear();

      // Auto-scale: keep model about 15% smaller than the tracked stone target
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const targetSize = 1.1;
        const s = targetSize / maxDim;
        modelEl.setAttribute("scale", `${s} ${s} ${s}`);
        // Center model at marker origin to reduce persistent alignment offset
        const center = box.getCenter(new THREE.Vector3());
        modelEl.setAttribute(
          "position",
          `${-center.x * s} ${-center.y * s} ${-center.z * s}`,
        );
      }

      mesh.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];
          originalMaterials.set(
            child.uuid,
            mats.map((m) => ({
              map: m.map || null,
              color: m.color ? m.color.clone() : null,
              vertexColors: m.vertexColors,
            })),
          );
        }
      });

      // Default state: dormant (no color). User taps "喚醒記憶" to restore full color.
      applyDormantLook();
    });
  }
});

onBeforeUnmount(() => {
  const scene = aSceneEl.value;
  if (scene) {
    const arSystem = scene.systems?.["mindar-image-system"];
    if (arSystem && arSystem.stop) arSystem.stop();
  }

  // 強制清除 A-Frame 留下的捲動鎖定類別與樣式
  document.documentElement.classList.remove("a-fullscreen");
  document.body.style.overflow = "";
  document.body.style.margin = "";
  document.body.style.height = "";
  document.body.style.width = "";

  if (restoreGetUserMedia) restoreGetUserMedia();
  currentModel = null;
  originalMaterials.clear();
});

// ---- Texture toggle ----

function applyDormantLook() {
  if (!currentModel) return;
  currentModel.traverse((child) => {
    if (child.isMesh) {
      const mats = Array.isArray(child.material)
        ? child.material
        : [child.material];
      mats.forEach((m) => {
        m.map = null;
        m.color.set(0x888888);
        m.vertexColors = false;
        m.needsUpdate = true;
      });
    }
  });
}

function restoreOriginalMaps() {
  if (!currentModel) return;
  currentModel.traverse((child) => {
    if (child.isMesh) {
      const origData = originalMaterials.get(child.uuid) || [];
      const mats = Array.isArray(child.material)
        ? child.material
        : [child.material];
      mats.forEach((m, i) => {
        const orig = origData[i];
        if (orig) {
          m.map = orig.map;
          if (orig.color) m.color.copy(orig.color);
          m.vertexColors = orig.vertexColors;
        }
        m.needsUpdate = true;
      });
    }
  });
}

function toggleTexture() {
  if (!currentModel || isTransitioning.value) return;
  isTransitioning.value = true;

  const toColor = !isColorMode.value;
  const duration = 800;
  const start = performance.now();
  let swapped = false;

  currentModel.traverse((child) => {
    if (child.isMesh) {
      const mats = Array.isArray(child.material)
        ? child.material
        : [child.material];
      mats.forEach((m) => {
        m.transparent = true;
      });
    }
  });

  let doSwap = () => (toColor ? restoreOriginalMaps() : applyDormantLook());

  function animateFade(now) {
    if (!currentModel) return;
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    if (progress < 0.5) {
      currentModel.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];
          mats.forEach((m) => {
            m.opacity = 1 - ease * 2;
          });
        }
      });
    } else {
      if (!swapped) {
        swapped = true;
        doSwap();
      }
      currentModel.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];
          mats.forEach((m) => {
            m.opacity = (ease - 0.5) * 2;
          });
        }
      });
    }

    if (progress < 1) {
      requestAnimationFrame(animateFade);
    } else {
      currentModel.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];
          mats.forEach((m) => {
            m.opacity = 1;
            m.transparent = false;
          });
        }
      });
      isColorMode.value = toColor;
      isTransitioning.value = false;
    }
  }

  requestAnimationFrame(animateFade);
}
</script>

<style scoped>
/* HUD floats fixed on top of fullscreen A-Frame */
.ar-hud {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.ar-hud-topbar {
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

.ar-hud-bottom {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.4s ease,
    opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<!-- Unscoped: ensure A-Frame fullscreen height chain works -->
<style>
html.a-fullscreen,
html.a-fullscreen body,
html.a-fullscreen body > #app,
html.a-fullscreen body > #app > *,
html.a-fullscreen body > #app > * > a-scene {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

html.a-fullscreen body > #app > * > a-scene {
  position: fixed !important;
  inset: 0 !important;
}
</style>
