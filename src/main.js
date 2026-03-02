import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { useSiteData } from './composables/useSiteData.js'

const app = createApp(App)
app.use(router)

// Preload site data before mounting
const { load } = useSiteData()
load().then(() => app.mount('#app'))

