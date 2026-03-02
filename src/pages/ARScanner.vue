<template>
  <div class="relative overflow-hidden" style="height: calc(100vh - 8rem);">
    <!-- A-Frame AR Scene (encantar + aframe declarative approach) -->
    <a-scene
      v-if="!arError"
      ref="aSceneEl"
      encantar="stats: false; gizmos: false"
      loading-screen="enabled: false"
      vr-mode-ui="enabled: false"
      class="w-full h-full"
    >
      <!-- Sources of data -->
      <ar-sources>
        <ar-camera-source resolution="lg" facing-mode="environment"></ar-camera-source>
      </ar-sources>

      <!-- Trackers -->
      <ar-trackers>
        <ar-image-tracker resolution="md">
          <ar-reference-image name="stone" src="/assets/Stone_scanImage.png"></ar-reference-image>
        </ar-image-tracker>
      </ar-trackers>

      <!-- AR Viewport with HUD -->
      <ar-viewport resolution="lg">
        <ar-hud>
          <div ref="hudOverlay" class="ar-hud-overlay">
            <!-- Top Bar -->
            <div class="ar-hud-top">
              <a href="/" class="ar-back-btn" @click.prevent="goHome">← 返回</a>
              <div class="ar-status-badge">
                <span v-if="!sessionReady" class="ar-status-loading">📷 啟動 AR 引擎中…</span>
                <span v-else-if="tracking" class="ar-status-tracking">
                  <span class="ar-pulse-dot"></span>
                  追蹤中：{{ stoneItem?.name }}
                </span>
                <span v-else class="ar-status-idle">將石板對準畫面</span>
              </div>
            </div>

            <!-- Bottom Controls (visible when tracking) -->
            <div v-if="tracking" class="ar-hud-bottom">
              <div class="ar-hud-bottom-inner">
                <div class="ar-item-info">
                  <h3 class="ar-item-name">{{ stoneItem?.thumbnail }} {{ stoneItem?.name }}</h3>
                  <p class="ar-item-status">
                    材質：{{ isColorMode ? '🎨 已喚醒色彩' : '✨ 原始石材' }}
                  </p>
                </div>

                <button
                  @click="toggleTexture"
                  :disabled="isTransitioning"
                  :class="['ar-toggle-btn', isColorMode ? 'ar-toggle-restore' : 'ar-toggle-awaken', isTransitioning ? 'ar-toggle-disabled' : '']"
                >
                  {{ isColorMode ? '🎨 回到原色' : '✨ 喚醒記憶' }}
                </button>

                <button @click="showStory = !showStory" class="ar-story-toggle">
                  {{ showStory ? '▲ 收起故事' : '▼ 看這件物品的故事' }}
                </button>
                <p v-if="showStory" class="ar-story-text">
                  {{ stoneItem?.story }}
                </p>
              </div>
            </div>
          </div>
        </ar-hud>
      </ar-viewport>

      <!-- Virtual camera for AR -->
      <ar-camera></ar-camera>

      <!-- Root node: this will be displayed when stone is tracked -->
      <ar-root reference-image="stone">
        <!-- Rotate from encantar coord (Z-up) to front view -->
        <a-entity rotation="-90 0 0" position="0 -0.5 0">
          <a-light type="ambient" intensity="0.6"></a-light>
          <a-light type="directional" intensity="1.2" position="5 10 7"></a-light>
          <a-entity
            ref="modelEntity"
            :gltf-model="stoneItem?.model_url || ''"
            rotation="90 0 0"
            scale="1 1 1"
          ></a-entity>
        </a-entity>
      </ar-root>
    </a-scene>

    <!-- Error screen -->
    <div v-if="arError" class="absolute inset-0 z-30 flex items-center justify-center bg-slate-900">
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
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import { useRouter } from 'vue-router'
import { useSiteData } from '../composables/useSiteData.js'

const router = useRouter()
const { items } = useSiteData()
const stoneItem = ref(null)

const aSceneEl = ref(null)
const modelEntity = ref(null)

const sessionReady = ref(false)
const tracking = ref(false)
const arError = ref(null)
const showStory = ref(false)

const isColorMode = ref(false)
const isTransitioning = ref(false)

let currentModel = null
const originalMaterials = new Map()

function goHome() {
  router.push('/')
}

onMounted(async () => {
  stoneItem.value = items.value[0]

  if (!window.AR) {
    arError.value = '此設備不支援 AR 功能，請使用較新的瀏覽器。'
    return
  }

  await nextTick()
  const sceneEl = aSceneEl.value

  if (!sceneEl) return

  // Wait for A-Frame scene to initialize
  const onArReady = () => {
    sessionReady.value = true
  }
  sceneEl.addEventListener('arready', onArReady)

  sceneEl.addEventListener('artargetfound', (e) => {
    tracking.value = true
  })

  sceneEl.addEventListener('artargetlost', (e) => {
    tracking.value = false
  })

  // When the model entity loads, grab the Three.js object for texture toggling
  await nextTick()
  const modelEl = modelEntity.value
  if (modelEl) {
    modelEl.addEventListener('model-loaded', (e) => {
      const model = modelEl.getObject3D('mesh')
      if (!model) return
      currentModel = model
      originalMaterials.clear()

      model.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          originalMaterials.set(
            child.uuid,
            mats.map((m) => ({
              map: m.map || null,
              color: m.color ? m.color.clone() : null,
              vertexColors: m.vertexColors
            }))
          )
        }
      })
    })
  }
})

onBeforeUnmount(() => {
  const sceneEl = aSceneEl.value
  if (sceneEl && sceneEl.systems && sceneEl.systems.ar && sceneEl.systems.ar.session) {
    try { sceneEl.systems.ar.session.end() } catch (e) { /* ignore */ }
  }
  currentModel = null
  originalMaterials.clear()
})

// ---- Texture toggle (same logic as Scanner.vue) ----

function applyMapToModel(tex) {
  if (!currentModel) return
  currentModel.traverse((child) => {
    if (child.isMesh) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => {
        m.map = tex
        m.color.set(0xffffff)
        m.vertexColors = false
        m.needsUpdate = true
      })
    }
  })
}

function restoreOriginalMaps() {
  if (!currentModel) return
  currentModel.traverse((child) => {
    if (child.isMesh) {
      const origData = originalMaterials.get(child.uuid) || []
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m, i) => {
        const orig = origData[i]
        if (orig) {
          m.map = orig.map
          if (orig.color) m.color.copy(orig.color)
          m.vertexColors = orig.vertexColors
        }
        m.needsUpdate = true
      })
    }
  })
}

function toggleTexture() {
  if (!currentModel || isTransitioning.value) return
  isTransitioning.value = true

  const toColor = !isColorMode.value
  const texUrl = toColor ? stoneItem.value?.original_texture : null
  const duration = 800
  const start = performance.now()
  let swapped = false

  currentModel.traverse((child) => {
    if (child.isMesh) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => { m.transparent = true })
    }
  })

  let doSwap = () => restoreOriginalMaps()

  function animateFade(now) {
    if (!currentModel) return
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2

    if (progress < 0.5) {
      currentModel.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((m) => { m.opacity = 1 - ease * 2 })
        }
      })
    } else {
      if (!swapped) {
        swapped = true
        doSwap()
      }
      currentModel.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((m) => { m.opacity = (ease - 0.5) * 2 })
        }
      })
    }

    if (progress < 1) {
      requestAnimationFrame(animateFade)
    } else {
      currentModel.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((m) => { m.opacity = 1; m.transparent = false })
        }
      })
      isColorMode.value = toColor
      isTransitioning.value = false
    }
  }

  if (toColor && texUrl) {
    new THREE.TextureLoader().load(
      texUrl,
      (tex) => {
        tex.flipY = false
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
        doSwap = () => applyMapToModel(tex)
        requestAnimationFrame(animateFade)
      },
      undefined,
      (err) => {
        console.error('Texture load error:', err)
        isTransitioning.value = false
      }
    )
  } else {
    requestAnimationFrame(animateFade)
  }
}
</script>

<style scoped>
/* A-Frame scene takes full space */
a-scene {
  position: absolute !important;
  inset: 0;
}

/* HUD overlay styles (not scoped by Tailwind since inside ar-hud) */
.ar-hud-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: system-ui, -apple-system, sans-serif;
}

.ar-hud-top {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.ar-back-btn {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background 0.2s;
}
.ar-back-btn:hover { background: rgba(0, 0, 0, 0.7); }

.ar-status-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  font-size: 0.875rem;
}
.ar-status-loading { color: #facc15; }
.ar-status-tracking { color: #4ade80; display: flex; align-items: center; gap: 0.25rem; }
.ar-status-idle { color: #cbd5e1; }

.ar-pulse-dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #4ade80;
  animation: pulse 2s infinite;
}

.ar-hud-bottom {
  pointer-events: auto;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.ar-hud-bottom-inner {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(51, 65, 85, 1);
  padding: 1rem;
}

.ar-item-info { margin-bottom: 0.75rem; }
.ar-item-name { color: white; font-weight: bold; font-size: 1.125rem; margin: 0; }
.ar-item-status { color: #94a3b8; font-size: 0.75rem; margin: 0.25rem 0 0; }

.ar-toggle-btn {
  width: 100%;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  border: none;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}
.ar-toggle-awaken {
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
}
.ar-toggle-awaken:hover { background: #6366f1; }
.ar-toggle-restore { background: #334155; color: white; }
.ar-toggle-restore:hover { background: #475569; }
.ar-toggle-disabled { opacity: 0.5; cursor: not-allowed; }

.ar-story-toggle {
  width: 100%;
  margin-top: 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  color: #818cf8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.ar-story-toggle:hover { color: #a5b4fc; }

.ar-story-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #cbd5e1;
  line-height: 1.625;
  background: rgba(30, 41, 59, 0.5);
  padding: 0.75rem;
  border-radius: 0.5rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>