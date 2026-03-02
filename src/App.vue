<template>
  <!-- AR page: no layout wrapper, A-Frame takes over the viewport -->
  <router-view v-if="isARPage" />

  <!-- Normal pages: standard layout -->
  <div v-else class="min-h-screen flex flex-col">
    <nav class="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <router-link to="/" class="text-lg font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
          ✦ {{ site().title || '萬物保存計畫' }}
        </router-link>
        <div class="flex gap-4">
          <router-link
            to="/wall"
            class="text-sm text-slate-300 hover:text-white transition-colors"
            active-class="!text-indigo-400 font-semibold"
          >
            物件牆
          </router-link>
          <router-link
            to="/scanner"
            class="text-sm text-slate-300 hover:text-white transition-colors"
            active-class="!text-indigo-400 font-semibold"
          >
            記憶掃描器
          </router-link>
          <router-link
            to="/ar"
            class="text-sm text-slate-300 hover:text-white transition-colors"
            active-class="!text-indigo-400 font-semibold"
          >
            AR 掃描
          </router-link>
        </div>
      </div>
    </nav>

    <main class="flex-1 min-h-0">
      <router-view />
    </main>

    <footer class="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
      {{ site().footer || '萬物保存計畫 Prototype © 2026' }}
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteData } from './composables/useSiteData.js'

const route = useRoute()
const { site } = useSiteData()
const isARPage = computed(() => route.path === '/ar')
</script>
