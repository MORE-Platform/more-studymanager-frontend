import { createRouter, createWebHistory } from 'vue-router'

//Routes
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'
import Study from '../views/Study.vue'

const routes = [
  {
    path: '/',
    meta: { title: 'Home' },
    component: Dashboard,
  },
  {
    path: '/study/:id',
    meta: { title: 'Study' },
    name: 'Study',
    component: Study,
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
