import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import ObjectWall from '../pages/ObjectWall.vue'
import Scanner from '../pages/Scanner.vue'
import ARScanner from '../pages/ARScanner.vue'
import ARJSScanner from '../pages/ARJSScanner.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/wall', name: 'ObjectWall', component: ObjectWall },
  { path: '/scanner', name: 'Scanner', component: Scanner },
  { path: '/ar', name: 'ARScanner', component: ARScanner },
  { path: '/arjs', name: 'ARJSScanner', component: ARJSScanner }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
