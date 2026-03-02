<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">🔍 {{ p.heading }}</h1>
    <p class="text-slate-400 mb-6">{{ p.description }}</p>

    <!-- Item Selector -->
    <div class="flex gap-3 mb-6">
      <button
        v-for="item in items"
        :key="item.id"
        @click="selectItem(item)"
        :class="[
          'px-4 py-2 rounded-lg text-sm transition-all duration-200',
          selectedItem?.id === item.id
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        ]"
      >
        {{ item.thumbnail }} {{ item.name }}
      </button>
    </div>

    <!-- 3D Viewport -->
    <div class="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
      <div ref="canvasContainer" class="w-full h-[500px]"></div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-slate-900/80"
      >
        <div class="text-center">
          <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span class="text-slate-400 text-sm">載入模型中...</span>
        </div>
      </div>

      <!-- Controls Overlay -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-white font-semibold">{{ selectedItem?.name }}</h3>
            <p class="text-xs text-slate-400">
              材質：{{ isColorMode ? p.colorStatus : p.stoneStatus }}
            </p>
          </div>
          <button
            @click="toggleTexture"
            :class="[
              'px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300',
              isColorMode
                ? 'bg-slate-600 hover:bg-slate-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
            ]"
          >
            {{ isColorMode ? p.stoneButton : p.colorButton }}
          </button>
        </div>
      </div>
    </div>

    <!-- Story Card -->
    <div v-if="selectedItem" class="mt-6 p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
      <h3 class="text-lg font-semibold text-indigo-400 mb-2">{{ p.storyLabel }}</h3>
      <p class="text-slate-300 leading-relaxed">{{ selectedItem.story }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useSiteData } from '../composables/useSiteData.js'

const { items, page } = useSiteData()
const p = computed(() => page('scanner'))

const canvasContainer = ref(null)
const selectedItem = ref(null)
const loading = ref(false)
const isColorMode = ref(false) // Default: stone mode
const isTransitioning = ref(false)

const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const controls = shallowRef(null)
const currentModel = shallowRef(null)
let animationId = null

const stoneMaterial = new THREE.MeshStandardMaterial({
  color: 0x8a8a8a,
  roughness: 0.9,
  metalness: 0.1
})

const originalMaterials = new Map()

function initScene() {
  const container = canvasContainer.value
  if (!container) return

  const s = new THREE.Scene()
  s.background = new THREE.Color(0x0f172a)
  scene.value = s

  const c = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000)
  c.position.set(0, 1.5, 3)
  camera.value = c

  const r = new THREE.WebGLRenderer({ antialias: true })
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
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
  dirLight.position.set(5, 10, 7)
  s.add(dirLight)
  const fillLight = new THREE.DirectionalLight(0x6366f1, 0.3)
  fillLight.position.set(-5, 3, -5)
  s.add(fillLight)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 1 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  s.add(ground)

  function animate() {
    animationId = requestAnimationFrame(animate)
    ctrl.update()
    r.render(s, c)
  }
  animate()

  window.addEventListener('resize', onResize)
}

function onResize() {
  const container = canvasContainer.value
  if (!container || !camera.value || !renderer.value) return
  camera.value.aspect = container.clientWidth / container.clientHeight
  camera.value.updateProjectionMatrix()
  renderer.value.setSize(container.clientWidth, container.clientHeight)
}

function loadModel(item) {
  if (!scene.value) return

  loading.value = true
  isColorMode.value = false // Always start as stone
  originalMaterials.clear()

  if (currentModel.value) {
    scene.value.remove(currentModel.value)
    currentModel.value = null
  }

  const loader = new GLTFLoader()
  loader.load(
    item.model_url,
    (gltf) => {
      const model = gltf.scene

      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 2 / maxDim
      model.scale.setScalar(scale)

      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center.multiplyScalar(scale))
      model.position.y += size.y * scale * 0.5

      // Store originals then apply stone
      model.traverse((child) => {
        if (child.isMesh) {
          originalMaterials.set(child.uuid, child.material.clone())
          child.material = stoneMaterial.clone()
        }
      })

      scene.value.add(model)
      currentModel.value = model
      loading.value = false
    },
    undefined,
    (err) => {
      console.error('Model load error:', err)
      loading.value = false
    }
  )
}

function toggleTexture() {
  if (!currentModel.value || isTransitioning.value) return
  isTransitioning.value = true

  const toColor = !isColorMode.value
  const duration = 800
  const start = performance.now()

  // Prepare target materials
  const targetMaterials = new Map()
  currentModel.value.traverse((child) => {
    if (child.isMesh) {
      if (toColor) {
        const orig = originalMaterials.get(child.uuid)
        if (orig) targetMaterials.set(child.uuid, orig.clone())
      } else {
        targetMaterials.set(child.uuid, stoneMaterial.clone())
      }
      // Ensure opacity is settable
      child.material.transparent = true
    }
  })

  function animateTransition(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // Smooth ease-in-out
    const ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2

    if (progress < 0.5) {
      // Fade out current
      currentModel.value.traverse((child) => {
        if (child.isMesh) child.material.opacity = 1 - ease * 2
      })
    } else {
      // Swap materials at midpoint
      if (progress >= 0.5 && elapsed < duration) {
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
      // Fade in new
      currentModel.value.traverse((child) => {
        if (child.isMesh) child.material.opacity = (ease - 0.5) * 2
      })
    }

    if (progress < 1) {
      requestAnimationFrame(animateTransition)
    } else {
      // Finalize
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

function selectItem(item) {
  selectedItem.value = item
  loadModel(item)
}

onMounted(() => {
  initScene()
  if (items.value.length > 0) {
    selectedItem.value = items.value[0]
    loadModel(items.value[0])
  }
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  if (renderer.value) {
    renderer.value.dispose()
    const container = canvasContainer.value
    if (container && renderer.value.domElement.parentNode === container) {
      container.removeChild(renderer.value.domElement)
    }
  }
})
</script>
