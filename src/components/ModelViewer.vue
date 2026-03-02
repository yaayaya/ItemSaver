<template>
  <div class="model-viewer-wrapper">
    <model-viewer
      :src="src"
      :alt="alt"
      :camera-orbit="cameraOrbit"
      :field-of-view="fieldOfView"
      camera-controls
      auto-rotate
      ar
      shadow-intensity="1"
      environment-image="neutral"
      style="width: 100%; height: 100%;"
    >
      <button
        slot="ar-button"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-full hover:bg-indigo-500 transition-colors"
      >
        📱 在 AR 中查看
      </button>
    </model-viewer>
  </div>
</template>

<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '3D Model' },
  cameraOrbit: { type: String, default: '0deg 75deg 105%' },
  fieldOfView: { type: String, default: '45deg' }
})
</script>

<style scoped>
.model-viewer-wrapper {
  width: 100%;
  height: 100%;
}
</style>
