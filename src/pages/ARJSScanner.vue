<template>
  <div class="arjs-container">
    <!-- Camera Permission Gate -->
    <div
      v-if="step === 'permission'"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 p-6"
    >
      <div class="text-center max-w-sm">
        <div class="text-6xl mb-6">📷</div>
        <h2 class="text-2xl font-bold text-white mb-3">需要相機權限</h2>
        <p class="text-slate-400 text-sm mb-8 leading-relaxed">
          AR.js 需要存取您的相機來進行實物掃描。<br />
          請在接下來的提示中允許相機存取。
        </p>
        <button
          @click="requestCamera"
          class="w-full px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-emerald-500/25"
        >
          開啟相機並啟動 AR
        </button>
        <router-link
          to="/"
          class="block mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          返回首頁
        </router-link>
      </div>
    </div>

    <!-- Loading AR.js -->
    <div
      v-if="step === 'loading'"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900"
    >
      <div class="text-center p-8">
        <div class="relative w-16 h-16 mx-auto mb-6">
          <div
            class="absolute inset-0 rounded-full border-4 border-emerald-500/20"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"
          ></div>
        </div>
        <h2 class="text-xl font-bold text-white mb-2">載入 AR 引擎</h2>
        <p class="text-slate-400 text-sm">正在初始化 NFT 追蹤模組…</p>
      </div>
    </div>

    <!-- AR.js Scene -->
    <a-scene
      v-if="step === 'ready' && !arError && stoneItem"
      ref="aSceneEl"
      embedded
      vr-mode-ui="enabled: false"
      renderer="logarithmicDepthBuffer: true; precision: mediump; antialias: true; alpha: true"
      arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false; displayWidth: 1280; displayHeight: 960; canvasWidth: 1280; canvasHeight: 960;"
      loading-screen="enabled: false"
    >
      <a-assets>
        <a-asset-item
          id="arjs-stone-model"
          :src="stoneItem.model_url"
        ></a-asset-item>
      </a-assets>

      <!-- 
        NFT 坐標系說明：
        NFT 單位通常對應圖片寬度。
        要把模型放大到比圖片大 15%，scale 應該設定在 1.15 左右 (基於模型原尺寸)。
        但因為 GLB 原始尺寸可能很小，我們需要動態計算或給予一個較大的基準。
        position 設定在中心。
      -->
      <a-nft
        ref="nftEntity"
        type="nft"
        url="/assets/Stone_scanImage"
        smooth="true"
        smoothCount="10"
        smoothTolerance="0.01"
        smoothThreshold="5"
      >
        <a-entity ref="modelContainer" position="100 150 0" rotation="-90 0 0">
          <a-light type="ambient" intensity="0.8"></a-light>
          <a-light
            type="directional"
            intensity="1.5"
            position="5 10 7"
          ></a-light>

          <a-gltf-model
            ref="modelEntity"
            src="#arjs-stone-model"
            scale="150 150 150"
            position="0 0 0"
          ></a-gltf-model>
        </a-entity>
      </a-nft>

      <a-entity camera></a-entity>
    </a-scene>

    <!-- HUD -->
    <div v-if="step === 'ready' && !arError" class="ar-hud">
      <div
        class="ar-hud-topbar pointer-events-auto flex items-center justify-between p-4"
      >
        <router-link
          to="/"
          class="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm"
        >
          ← 返回
        </router-link>
        <div
          class="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-sm"
        >
          <span v-if="!sessionReady" class="text-yellow-400">📷 啟動中…</span>
          <span
            v-else-if="tracking"
            class="text-green-400 flex items-center gap-1"
          >
            <span
              class="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"
            ></span>
            偵測到：{{ stoneItem?.name }}
          </span>
          <span v-else class="text-slate-300">掃描石板...</span>
        </div>
      </div>

      <Transition name="slide-up">
        <div
          v-if="tracking"
          class="ar-hud-bottom pointer-events-auto absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 pb-8"
        >
          <div class="mb-3 text-center">
            <h3 class="text-white font-bold text-lg">
              {{ stoneItem?.thumbnail }} {{ stoneItem?.name }}
            </h3>
            <p
              class="text-[10px] text-slate-500 uppercase tracking-widest mt-1"
            >
              AR.js NFT Performance Mode
            </p>
          </div>

          <button
            @click="toggleTexture"
            :disabled="isTransitioning"
            :class="[
              'w-full px-5 py-4 rounded-xl font-bold text-base transition-all duration-300',
              isColorMode
                ? 'bg-slate-700 text-white'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25',
              isTransitioning ? 'opacity-50 cursor-not-allowed' : '',
            ]"
          >
            {{ isColorMode ? "🎨 回到原色" : "✨ 喚醒記憶" }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Scanning hint -->
    <div
      v-if="step === 'ready' && sessionReady && !tracking && !arError"
      class="ar-scan-hint"
    >
      <span class="ar-scan-dot"></span>
      對準石板紋路...
    </div>

    <!-- Error screen -->
    <div
      v-if="arError"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900"
    >
      <div class="text-center p-8 max-w-md">
        <h2 class="text-xl font-bold text-white mb-2">AR 無法啟動</h2>
        <p class="text-slate-400 mb-6">{{ arError }}</p>
        <button
          @click="retryInit"
          class="px-6 py-3 rounded-xl bg-emerald-600 text-white"
        >
          🔄 重試
        </button>
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
const nftEntity = ref(null);
const modelEntity = ref(null);
const modelContainer = ref(null);

const step = ref("permission");
const sessionReady = ref(false);
const tracking = ref(false);
const arError = ref(null);

const isColorMode = ref(false);
const isTransitioning = ref(false);

let currentModel = null;
const originalMaterials = new Map();

// ---- Cleanup Helper ----
function cleanupARJS() {
  console.log("[ARJSScanner] Starting cleanup...");

  // 1. Stop AR.js and A-Frame
  if (aSceneEl.value) {
    const scene = aSceneEl.value;
    try {
      if (scene.systems?.arjs) scene.systems.arjs.stop();
      if (scene.pause) scene.pause();
    } catch (e) {
      console.warn(e);
    }
  }

  // 2. Remove all injected video elements (AR.js injects these to body)
  const videos = document.querySelectorAll("video");
  videos.forEach((v) => {
    if (v.parentNode) v.parentNode.removeChild(v);
  });

  // 3. Remove injected canvas if any
  const canvases = document.querySelectorAll(".a-canvas");
  canvases.forEach((c) => {
    if (c.parentNode) c.parentNode.removeChild(c);
  });

  // 4. Remove AR.js generated styles on html/body
  document.documentElement.classList.remove("a-fullscreen");
  document.body.style.overflow = "";
  document.body.style.margin = "";
  document.body.style.height = "";
  document.body.style.width = "";
}

// ---- Lifecycle ----
onMounted(() => {
  stoneItem.value = items.value[0];
});

onBeforeUnmount(() => {
  cleanupARJS();
});

// ---- Camera & Init ----
async function requestCamera() {
  step.value = "loading";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    stream.getTracks().forEach((t) => t.stop());

    // Load AR.js if not present
    if (!window.AFRAME.components["arjs"]) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    step.value = "ready";
    await nextTick();
    initARListeners();
  } catch (e) {
    arError.value = "相機存取被拒絕，或瀏覽器不支持此功能。";
    step.value = "permission";
  }
}

function initARListeners() {
  const sceneEl = aSceneEl.value;
  if (!sceneEl) return;

  sceneEl.addEventListener("loaded", () => {
    sessionReady.value = true;
    console.log("Scene Loaded");
  });

  const nftEl = nftEntity.value;
  if (nftEl) {
    nftEl.addEventListener("markerFound", () => {
      tracking.value = true;
      console.log("NFT Found");
    });
    nftEl.addEventListener("markerLost", () => {
      tracking.value = false;
    });
  }

  const modelEl = modelEntity.value;
  if (modelEl) {
    modelEl.addEventListener("model-loaded", () => {
      const mesh = modelEl.getObject3D("mesh");
      if (!mesh) return;
      currentModel = mesh;

      // Auto-scale to be 15% larger than default aspect
      // In NFT mode, we use the image-target coordinates.
      // We scale the model to a reasonable pixel-base size.
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // Request: "大 15% 就好"
      // Based on common NFT scale experiences, we target around 300-400 units
      const targetUnitSize = 345; // 300 * 1.15
      const s = targetUnitSize / maxDim;
      modelEl.setAttribute("scale", `${s} ${s} ${s}`);

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
      applyDormantLook();
    });
  }
}

function retryInit() {
  cleanupARJS();
  arError.value = null;
  step.value = "permission";
}

// ---- Texture Logic (Same as before) ----
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

  // Simple swap for robustness in AR.js
  if (toColor) restoreOriginalMaps();
  else applyDormantLook();

  isColorMode.value = toColor;
  isTransitioning.value = false;
}
</script>

<style scoped>
.arjs-container {
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

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

.ar-scan-hint {
  position: fixed;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ar-scan-dot {
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
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
</style>

<style>
/* 
  強制修正 AR.js 注入 body 的 video 元件 
  使其滿版且不會遮擋 UI
*/
video {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  z-index: -1 !important;
}

.a-canvas {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 1 !important;
}

html.a-fullscreen,
html.a-fullscreen body {
  overflow: hidden !important;
  height: 100% !important;
  width: 100% !important;
}
</style>
