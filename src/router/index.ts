import { createRouter, createWebHistory } from 'vue-router'

//Routes
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    meta: { title: 'Home' },
    component: Dashboard,
  },
  {
    path: '/:page',
    component: NotFound,
  },
]

export const Router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  history: createWebHistory(),
  routes,
})
