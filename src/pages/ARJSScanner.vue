<template>
  <div>
    <!-- Camera Permission Gate -->
    <div
      v-if="step === 'permission'"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 p-6"
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900"
    >
      <div class="text-center p-8">
        <div class="relative w-16 h-16 mx-auto mb-6">
          <div
            class="absolute inset-0 rounded-full border-4 border-emerald-500/20"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"
          ></div>
          <div
            class="absolute inset-2 rounded-full border-4 border-indigo-500/20"
          ></div>
          <div
            class="absolute inset-2 rounded-full border-4 border-indigo-500 border-b-transparent animate-spin"
            style="animation-direction: reverse; animation-duration: 0.8s"
          ></div>
        </div>
        <h2 class="text-xl font-bold text-white mb-2">載入 AR.js 引擎</h2>
        <p class="text-slate-400 text-sm">正在初始化 NFT 追蹤模組…</p>
      </div>
    </div>

    <!-- AR.js + A-Frame Scene — NFT tracking -->
    <a-scene
      v-if="step === 'ready' && !arError && stoneItem"
      ref="aSceneEl"
      vr-mode-ui="enabled: false"
      renderer="logarithmicDepthBuffer: true; precision: mediump; antialias: true; alpha: true"
      arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false; sourceWidth: 1280; sourceHeight: 960; displayWidth: 1280; displayHeight: 960;"
      loading-screen="enabled: false"
      device-orientation-permission-ui="enabled: false"
    >
      <a-assets>
        <a-asset-item
          id="arjs-stone-model"
          :src="stoneItem.model_url"
        ></a-asset-item>
      </a-assets>

      <a-nft
        ref="nftEntity"
        type="nft"
        url="/assets/Stone_scanImage"
        smooth="true"
        smoothCount="10"
        smoothTolerance="0.01"
        smoothThreshold="5"
      >
        <a-light type="ambient" intensity="0.6"></a-light>
        <a-light type="directional" intensity="1.2" position="5 10 7"></a-light>
        <a-gltf-model
          ref="modelEntity"
          src="#arjs-stone-model"
          scale="5 5 5"
          position="150 300 0"
          rotation="0 0 0"
        ></a-gltf-model>
      </a-nft>

      <a-entity camera></a-entity>
    </a-scene>

    <!-- HUD overlay — fixed on top of fullscreen A-Frame -->
    <div v-if="step === 'ready' && !arError" class="ar-hud">
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
            >📷 啟動 AR.js 引擎中…</span
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

      <!-- AR.js badge -->
      <div class="ar-badge pointer-events-none">
        <span class="ar-badge-dot"></span>
        AR.js NFT 測試模式
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

    <!-- Scanning hint — minimal, no frame constraints -->
    <div
      v-if="step === 'ready' && sessionReady && !tracking && !arError"
      class="ar-scan-hint"
    >
      <span class="ar-scan-dot"></span>
      將石板移入畫面，系統自動識別
    </div>

    <!-- Error screen -->
    <div
      v-if="arError"
      class="fixed inset-0 z-30 flex items-center justify-center bg-slate-900"
    >
      <div class="text-center p-8 max-w-md">
        <div class="text-5xl mb-4">📷</div>
        <h2 class="text-xl font-bold text-white mb-2">AR 功能無法啟動</h2>
        <p class="text-slate-400 mb-6">{{ arError }}</p>
        <div class="flex gap-3 justify-center">
          <button
            @click="retryInit"
            class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            🔄 重試
          </button>
          <router-link
            to="/"
            class="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors inline-block"
          >
            返回首頁
          </router-link>
        </div>
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

// step: 'permission' | 'loading' | 'ready'
const step = ref("permission");
const sessionReady = ref(false);
const tracking = ref(false);
const arError = ref(null);
const showStory = ref(false);

const isColorMode = ref(false);
const isTransitioning = ref(false);

let currentModel = null;
const originalMaterials = new Map();
let arjsScriptEl = null;

// ---- Dynamic AR.js loader ----
function loadARJS() {
  return new Promise((resolve, reject) => {
    // Check if already loaded (e.g. navigated back)
    if (window.AFRAME && window.AFRAME.components["arjs"]) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar-nft.js";
    script.onload = () => {
      console.log("[ARJSScanner] AR.js NFT loaded successfully");
      resolve();
    };
    script.onerror = () => {
      reject(new Error("無法載入 AR.js 函式庫"));
    };
    arjsScriptEl = script;
    document.head.appendChild(script);
  });
}

// ---- Camera permission then init ----
async function requestCamera() {
  step.value = "loading";
  try {
    // Explicitly request camera — this triggers the browser permission dialog
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    // Stop the test stream immediately; AR.js will open its own
    stream.getTracks().forEach((t) => t.stop());
  } catch (e) {
    arError.value = "相機存取被拒絕，請在瀏覽器設定中允許相機權限後重試。";
    step.value = "permission";
    return;
  }
  await initAR();
}

async function initAR() {
  arError.value = null;

  try {
    await loadARJS();
    step.value = "ready";
  } catch (e) {
    arError.value = e.message || "AR.js 載入失敗，請檢查網路連線。";
    step.value = "permission";
    return;
  }

  stoneItem.value = items.value[0];
  if (!stoneItem.value) {
    arError.value = "找不到可用的物件資料";
    return;
  }

  await nextTick();
  await nextTick(); // double nextTick to ensure a-scene is in DOM

  const sceneEl = aSceneEl.value;
  if (!sceneEl) {
    arError.value = "AR 場景初始化失敗";
    return;
  }

  // Scene ready
  const onSceneReady = () => {
    sessionReady.value = true;
    console.log("[ARJSScanner] AR scene ready");
  };

  if (sceneEl.hasLoaded) {
    onSceneReady();
  } else {
    sceneEl.addEventListener("loaded", onSceneReady);
  }

  sceneEl.addEventListener("arError", () => {
    arError.value = "相機啟動失敗，請允許相機權限後重試。";
  });

  await nextTick();

  // NFT tracking events
  const nftEl = nftEntity.value;
  if (nftEl) {
    nftEl.addEventListener("markerFound", () => {
      tracking.value = true;
      console.log("[ARJSScanner] NFT marker found!");
    });
    nftEl.addEventListener("markerLost", () => {
      tracking.value = false;
      console.log("[ARJSScanner] NFT marker lost");
    });
  }

  // Model loaded event
  const modelEl = modelEntity.value;
  if (modelEl) {
    modelEl.addEventListener("model-loaded", () => {
      const mesh = modelEl.getObject3D("mesh");
      if (!mesh) return;
      currentModel = mesh;
      originalMaterials.clear();

      console.log("[ARJSScanner] Model loaded successfully");

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

      // Default: dormant grey look
      applyDormantLook();
    });
  }
}

function retryInit() {
  arError.value = null;
  step.value = "permission";
  sessionReady.value = false;
  tracking.value = false;
}

onMounted(() => {
  // Don't auto-start — wait for user to tap "開啟相機"
});

onBeforeUnmount(() => {
  // Clean up the AR.js scene
  const scene = aSceneEl.value;
  if (scene) {
    try {
      const arSystem = scene.systems?.["arjs"];
      if (arSystem && arSystem.stop) arSystem.stop();
    } catch (e) {
      console.warn("[ARJSScanner] Error stopping AR system:", e);
    }
  }
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

/* AR.js badge */
.ar-badge {
  position: fixed;
  top: 4.5rem;
  right: 1rem;
  z-index: 11;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.75);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.ar-badge-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6ee7b7;
  animation: badge-pulse 1.5s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.7);
  }
}

/* Minimal scanning hint pill at the bottom */
.ar-scan-hint {
  position: fixed;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  pointer-events: none;
  white-space: nowrap;
}

.ar-scan-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a5b4fc;
  animation: dot-pulse 1.8s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.65);
  }
}

/* Transitions */
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
