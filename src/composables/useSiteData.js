import { ref } from 'vue'

const siteData = ref(null)
const items = ref([])
let loaded = false

export function useSiteData() {
  async function load() {
    if (loaded) return
    try {
      const res = await fetch('/data/site.json')
      const data = await res.json()
      siteData.value = data
      items.value = data.items || []
      loaded = true
    } catch (e) {
      console.error('Failed to load site.json:', e)
    }
  }

  function page(name) {
    return siteData.value?.pages?.[name] || {}
  }

  function site() {
    return siteData.value?.site || {}
  }

  return { siteData, items, load, page, site }
}
