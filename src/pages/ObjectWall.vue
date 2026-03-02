<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">🏛️ {{ p.heading }}</h1>
    <p class="text-slate-400 mb-8">{{ p.description }}</p>

    <!-- Item Grid (model-viewer preview cards) -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <button
        v-for="item in items"
        :key="item.id"
        @click="openViewer(item)"
        class="group rounded-2xl bg-slate-800/60 border border-slate-700 overflow-hidden hover:border-indigo-500/50 hover:scale-[1.03] transition-all duration-300 text-left"
      >
        <!-- 3D Model Preview (lightweight, no interaction) -->
        <div class="h-36 sm:h-44 bg-slate-900 relative">
          <model-viewer
            :src="item.model_url"
            :alt="item.name"
            auto-rotate
            rotation-per-second="30deg"
            interaction-prompt="none"
            shadow-intensity="0.5"
            environment-image="neutral"
            camera-orbit="0deg 65deg 105%"
            disable-zoom
            style="width: 100%; height: 100%; pointer-events: none;"
          ></model-viewer>
        </div>
        <!-- Name -->
        <div class="p-3 text-center">
          <h3 class="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
            {{ item.name }}
          </h3>
          <p class="text-xs text-slate-500 mt-1">點擊查看</p>
        </div>
      </button>
    </div>

    <!-- Fullscreen Viewer (opens directly) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="activeItem" class="fixed inset-0 z-[200] bg-black flex flex-col">
          <!-- Top Bar -->
          <div class="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-sm z-10">
            <h3 class="text-white font-bold text-lg">{{ activeItem.name }}</h3>
            <div class="flex gap-2">
              <!-- Toggle UI controls -->
              <button
                @click="showControls = !showControls"
                :class="[
                  'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm transition-colors',
                  showControls ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-700/80 hover:bg-slate-600'
                ]"
                title="顯示/隱藏控制按鈕"
              >
                🔍
              </button>
              <button
                @click="closeViewer"
                class="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white text-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Full Model -->
          <div class="flex-1 relative">
            <model-viewer
              ref="viewerEl"
              :src="activeItem.model_url"
              :alt="activeItem.name"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              environment-image="neutral"
              style="width: 100%; height: 100%;"
            ></model-viewer>

            <!-- Zoom Controls (toggle) -->
            <Transition name="fade">
              <div v-if="showControls" class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
                <button
                  @click="zoomIn"
                  class="w-14 h-14 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-3xl font-bold flex items-center justify-center shadow-lg transition-colors active:scale-95"
                >
                  +
                </button>
                <button
                  @click="resetZoom"
                  class="w-14 h-14 rounded-full bg-slate-600/90 hover:bg-slate-500 text-white text-lg font-bold flex items-center justify-center shadow-lg transition-colors active:scale-95"
                >
                  ↺
                </button>
                <button
                  @click="zoomOut"
                  class="w-14 h-14 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-3xl font-bold flex items-center justify-center shadow-lg transition-colors active:scale-95"
                >
                  −
                </button>
              </div>
            </Transition>

            <!-- Hint -->
            <div class="absolute bottom-3 left-3 text-xs text-slate-400 bg-slate-900/60 px-2 py-1 rounded">
              {{ p.hint }}
            </div>
          </div>

          <!-- Story Bar -->
          <div class="px-4 py-3 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700">
            <h4 class="text-sm font-semibold text-indigo-400 mb-1">{{ p.storyLabel }}</h4>
            <p class="text-slate-300 text-sm leading-relaxed">{{ activeItem.story }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import '@google/model-viewer'
import { ref, computed } from 'vue'
import { useSiteData } from '../composables/useSiteData.js'

const { items, page } = useSiteData()
const p = computed(() => page('wall'))

const activeItem = ref(null)
const showControls = ref(false)
const viewerEl = ref(null)

function openViewer(item) {
  activeItem.value = item
  showControls.value = false
  document.body.style.overflow = 'hidden'
}

function closeViewer() {
  activeItem.value = null
  document.body.style.overflow = ''
}

function zoomIn() {
  if (viewerEl.value) {
    const fov = parseFloat(viewerEl.value.getFieldOfView())
    viewerEl.value.fieldOfView = Math.max(fov - 10, 10) + 'deg'
  }
}
function zoomOut() {
  if (viewerEl.value) {
    const fov = parseFloat(viewerEl.value.getFieldOfView())
    viewerEl.value.fieldOfView = Math.min(fov + 10, 90) + 'deg'
  }
}
function resetZoom() {
  if (viewerEl.value) {
    viewerEl.value.fieldOfView = '45deg'
    viewerEl.value.cameraOrbit = '0deg 75deg 105%'
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
