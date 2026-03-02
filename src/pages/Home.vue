<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
    <!-- Hero -->
    <div class="mb-8">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        <span class="text-indigo-400">✦</span> {{ p.heading }}
      </h1>
      <p class="text-slate-400 text-lg max-w-md mx-auto leading-relaxed whitespace-pre-line">
        {{ p.description }}
      </p>
    </div>

    <!-- Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
      <router-link
        to="/wall"
        class="group p-6 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300"
      >
        <div class="text-4xl mb-3">{{ p.cards?.wall?.icon }}</div>
        <h2 class="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
          {{ p.cards?.wall?.title }}
        </h2>
        <p class="text-sm text-slate-400">{{ p.cards?.wall?.description }}</p>
      </router-link>

      <router-link
        to="/scanner"
        class="group p-6 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300"
      >
        <div class="text-4xl mb-3">{{ p.cards?.scanner?.icon }}</div>
        <h2 class="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
          {{ p.cards?.scanner?.title }}
        </h2>
        <p class="text-sm text-slate-400">{{ p.cards?.scanner?.description }}</p>
      </router-link>

      <router-link
        to="/ar"
        class="group p-6 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-green-500/50 hover:bg-slate-800 transition-all duration-300"
      >
        <div class="text-4xl mb-3">{{ p.cards?.ar?.icon }}</div>
        <h2 class="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
          {{ p.cards?.ar?.title }}
        </h2>
        <p class="text-sm text-slate-400">{{ p.cards?.ar?.description }}</p>
      </router-link>
    </div>

    <!-- Tech Badge -->
    <div class="mt-12 flex gap-3 text-xs text-slate-600">
      <span class="px-2 py-1 rounded bg-slate-800/50">Vue 3</span>
      <span class="px-2 py-1 rounded bg-slate-800/50">Three.js</span>
      <span class="px-2 py-1 rounded bg-slate-800/50">model-viewer</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSiteData } from '../composables/useSiteData.js'
const { page } = useSiteData()
const p = computed(() => page('home'))
</script>
