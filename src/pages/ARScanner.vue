<template>
  <div class="relative min-h-[calc(100vh-8rem)]">
    <!-- Camera View (Full screen background) -->
    <div class="absolute inset-0 bg-black">
      <video
        ref="videoEl"
        autoplay
        playsinline
        muted
        class="w-full h-full object-cover"
      ></video>

      <!-- Three.js AR overlay -->
      <div ref="arOverlay" class="absolute inset-0 pointer-events-none"></div>
    </div>

    <!-- Top Bar -->
    <div class="relative z-10 p-4">
      <div class="flex items-center justify-between">
        <router-link
          to="/"
          class="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm hover:bg-black/70 transition-colors"
        >
          ← 返回
        </router-link>
        <div class="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-sm">
          <span v-if="!cameraReady" class="text-yellow-400">{{ p.cameraLoading }}</span>
          <span v-else-if="detectedItem" class="text-green-400">✅ 偵測到：{{ detectedItem.name }}</span>
          <span v-else class="text-slate-300">{{ p.scanning }}</span>
        </div>
      </div>
    </div>

    <!-- Scan Frame Guide -->
    <div v-if="cameraReady && !detectedItem" class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div class="w-64 h-64 border-2 border-dashed border-indigo-400/60 rounded-2xl flex items-center justify-center">
        <p class="text-indigo-300/80 text-sm text-center px-4 whitespace-pre-line">
          {{ p.scanGuide }}
        </p>
      </div>
    </div>

    <!-- Detection Simulation Buttons (for demo) -->
    <div v-if="cameraReady && !detectedItem" class="absolute bottom-24 left-0 right-0 z-20 px-4">
      <p class="text-center text-xs text-slate-400 mb-3">{{ p.demoHint }}</p>
      <div class="flex gap-3 justify-center">
        <button
          v-for="item in mockItems"
          :key="item.id"
          @click="simulateDetection(item)"
          class="px-5 py-3 rounded-xl bg-indigo-600/80 backdrop-blur-sm hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          {{ item.thumbnail }} 偵測 {{ item.name }}
        </button>
      </div>
    </div>

    <!-- Detected Model Panel -->
    <Transition name="slide-up">
      <div v-if="detectedItem" class="absolute bottom-0 left-0 right-0 z-20">
        <!-- 3D Model Display (AR overlay scene) -->
        <div ref="modelContainer" class="w-full h-[350px] pointer-events-auto"></div>

        <!-- Control Bar -->
        <div class="bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 pointer-events-auto">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-white font-bold text-lg">{{ detectedItem.thumbnail }} {{ detectedItem.name }}</h3>
              <p class="text-xs text-slate-400">
                材質：{{ isColorMode ? p.colorStatus : p.stoneStatus }}
              </p>
            </div>
            <button
              @click="dismissDetection"
              class="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div class="flex gap-3">
            <!-- Toggle Texture Button -->
            <button
              @click="toggleTexture"
              :class="[
                'flex-1 px-5 py-3 rounded-xl font-medium text-base transition-all duration-300',
                isColorMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              ]"
            >
              {{ isColorMode ? p.stoneButton : p.colorButton }}
            </button>

            <!-- AR View Button -->
            <button
              @click="enterARView"
              class="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium text-base transition-colors"
            >
              {{ p.arButton }}
            </button>
          </div>

          <!-- Story (collapsible) -->
          <button
            @click="showStory = !showStory"
            class="w-full mt-3 text-left text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {{ showStory ? p.storyToggleHide : p.storyToggleShow }}
          </button>
          <Transition name="fade">
            <p v-if="showStory" class="mt-2 text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-lg">
              {{ detectedItem.story }}
            </p>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- AR model-viewer (hidden, activated by AR button) -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showARViewer"
          class="fixed inset-0 z-[200] bg-black flex flex-col"
        >
          <div class="flex items-center justify-between p-4 bg-slate-900/90">
            <h3 class="text-white font-bold">{{ detectedItem?.name }} - AR 實景</h3>
            <button
              @click="showARViewer = false"
              class="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
          <div class="flex-1 relative">
            <model-viewer
              v-if="detectedItem"
              :src="detectedItem.model_url"
              :alt="detectedItem.name"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              environment-image="neutral"
              style="width: 100%; height: 100%;"
            >
              <button
                slot="ar-button"
                class="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-full font-medium text-lg hover:bg-green-500 transition-colors shadow-xl"
              >
                🔮 放置到現實世界
              </button>
            </model-viewer>
          </div>

          <!-- AR Texture Toggle -->
          <div class="p-4 bg-slate-900/90 border-t border-slate-700">
            <button
              @click="toggleTexture"
              :class="[
                'w-full px-5 py-3 rounded-xl font-medium text-base transition-all duration-300',
                isColorMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              ]"
            >
              {{ isColorMode ? p.stoneButton : p.colorButton }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Camera Error -->
    <div v-if="cameraError" class="absolute inset-0 z-30 flex items-center justify-center bg-slate-900">
      <div class="text-center p-8">
        <div class="text-5xl mb-4">📷</div>
        <h2 class="text-xl font-bold text-white mb-2">{{ p.cameraError?.title }}</h2>
        <p class="text-slate-400 mb-4">{{ p.cameraError?.message }}</p>
        <button
          @click="initCamera"
          class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          {{ p.cameraError?.retry || '重試' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@google/model-viewer'
import { ref, computed, onMounted, onBeforeUnmount, shallowRef, nextTick, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useSiteData } from '../composables/useSiteData.js'

const { items, page } = useSiteData()
const p = computed(() => page('ar'))
const mockItems = computed(() => items.value)

// Camera state
const videoEl = ref(null)
const cameraReady = ref(false)
const cameraError = ref(false)
let mediaStream = null

// Detection state
const detectedItem = ref(null)
const showStory = ref(false)
const showARViewer = ref(false)

// Three.js scene state
const modelContainer = ref(null)
const isColorMode = ref(false) // Start as stone (not yet "awakened")
const isTransitioning = ref(false)

const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const controls = shallowRef(null)
const currentModel = shallowRef(null)
let animationId = null
const originalMaterials = new Map()

const stoneMaterial = new THREE.MeshStandardMaterial({
  color: 0x8a8a8a,
  roughness: 0.9,
  metalness: 0.1
})

// Camera initialization
async function initCamera() {
  cameraError.value = false
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    })
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream
      cameraReady.value = true
    }
  } catch (err) {
    console.error('Camera error:', err)
    cameraError.value = true
  }
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
}

// Simulate marker detection (DEMO)
function simulateDetection(item) {
  detectedItem.value = item
  isColorMode.value = false
  showStory.value = false
  nextTick(() => initThreeScene(item))
}

function dismissDetection() {
  detectedItem.value = null
  showStory.value = false
  showARViewer.value = false
  cleanupThreeScene()
}

// Three.js scene for detected model
function initThreeScene(item) {
  const container = modelContainer.value
  if (!container) return

  cleanupThreeScene()

  const s = new THREE.Scene()
  s.background = new THREE.Color(0x111827)
  scene.value = s

  const c = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000)
  c.position.set(0, 1.5, 3)
  camera.value = c

  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  r.setSize(container.clientWidth, container.clientHeight)
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  r.toneMapping = THREE.ACESFilmicToneMapping
  r.toneMappingExposure = 1.2
  container.appendChild(r.domElement)
  renderer.value = r

  const ctrl = new OrbitControls(c, r.domElement)
  ctrl.enableDamping = true
  ctrl.dampingFactor = 0.05
  ctrl.target.set(0, 0.8, 0)
  ctrl.update()
  controls.value = ctrl

  s.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dir = new THREE.DirectionalLight(0xffffff, 1.2)
  dir.position.set(5, 10, 7)
  s.add(dir)
  const fill = new THREE.DirectionalLight(0x6366f1, 0.3)
  fill.position.set(-5, 3, -5)
  s.add(fill)

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 1 })
  )
  ground.rotation.x = -Math.PI / 2
  s.add(ground)

  function animate() {
    animationId = requestAnimationFrame(animate)
    ctrl.update()
    r.render(s, c)
  }
  animate()

  loadModel(item)
}

function loadModel(item) {
  if (!scene.value) return
  originalMaterials.clear()

  if (currentModel.value) {
    scene.value.remove(currentModel.value)
    currentModel.value = null
  }

  const loader = new GLTFLoader()
  loader.load(item.model_url, (gltf) => {
    const model = gltf.scene

    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2 / maxDim
    model.scale.setScalar(scale)

    const center = box.getCenter(new THREE.Vector3())
    model.position.sub(center.multiplyScalar(scale))
    model.position.y += size.y * scale * 0.5

    model.traverse((child) => {
      if (child.isMesh) {
        originalMaterials.set(child.uuid, child.material.clone())
      }
    })

    scene.value.add(model)
    currentModel.value = model

    // Default to stone mode
    applyStoneTexture()
  })
}

function applyStoneTexture() {
  if (!currentModel.value) return
  currentModel.value.traverse((child) => {
    if (child.isMesh) child.material = stoneMaterial.clone()
  })
}

function applyColorTexture() {
  if (!currentModel.value) return
  currentModel.value.traverse((child) => {
    if (child.isMesh) {
      const orig = originalMaterials.get(child.uuid)
      if (orig) child.material = orig.clone()
    }
  })
}

function toggleTexture() {
  if (!currentModel.value || isTransitioning.value) return
  isTransitioning.value = true

  const toColor = !isColorMode.value
  const duration = 800
  const start = performance.now()

  const targetMaterials = new Map()
  currentModel.value.traverse((child) => {
    if (child.isMesh) {
      if (toColor) {
        const orig = originalMaterials.get(child.uuid)
        if (orig) targetMaterials.set(child.uuid, orig.clone())
      } else {
        targetMaterials.set(child.uuid, stoneMaterial.clone())
      }
      child.material.transparent = true
    }
  })

  let swapped = false
  function animateTransition(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2

    if (progress < 0.5) {
      currentModel.value.traverse((child) => {
        if (child.isMesh) child.material.opacity = 1 - ease * 2
      })
    } else {
      if (!swapped) {
        swapped = true
        currentModel.value.traverse((child) => {
          if (child.isMesh) {
            const target = targetMaterials.get(child.uuid)
            if (target) {
              child.material = target
              child.material.transparent = true
              child.material.opacity = 0
            }
          }
        })
      }
      currentModel.value.traverse((child) => {
        if (child.isMesh) child.material.opacity = (ease - 0.5) * 2
      })
    }

    if (progress < 1) {
      requestAnimationFrame(animateTransition)
    } else {
      currentModel.value.traverse((child) => {
        if (child.isMesh) {
          child.material.opacity = 1
          child.material.transparent = false
        }
      })
      isColorMode.value = toColor
      isTransitioning.value = false
    }
  }

  requestAnimationFrame(animateTransition)
}

function enterARView() {
  showARViewer.value = true
}

function cleanupThreeScene() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (renderer.value) {
    renderer.value.dispose()
    const container = modelContainer.value
    if (container && renderer.value.domElement?.parentNode === container) {
      container.removeChild(renderer.value.domElement)
    }
  }
  scene.value = null
  camera.value = null
  renderer.value = null
  controls.value = null
  currentModel.value = null
  originalMaterials.clear()
}

function onResize() {
  const container = modelContainer.value
  if (!container || !camera.value || !renderer.value) return
  camera.value.aspect = container.clientWidth / container.clientHeight
  camera.value.updateProjectionMatrix()
  renderer.value.setSize(container.clientWidth, container.clientHeight)
}

onMounted(() => {
  initCamera()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  stopCamera()
  cleanupThreeScene()
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s ease, opacity 0.3s ease;
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
