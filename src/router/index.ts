import { createRouter, createWebHistory } from 'vue-router'

//Routes
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'
import Study from '../views/Overview.vue'
import Interventions from '../views/Interventions.vue'
import Participants from '../views/Participants.vue'
import Observations from '../views/Observations.vue'
import Data from '../views/Data.vue'

const routes = [
  {
    path: '/',
    meta: { title: 'Dashboard' },
    component: Dashboard,
  },
  {
    path: '/studies/:studyId',
    meta: { title: 'Overview' },
    name: 'Overview',
    component: Study,
  },
  {
    path: '/studies/:studyId/participants',
    meta: { title: 'Participants' },
    name: 'Participants',
    component: Participants,
  },
  {
    path: '/studies/:studyId/observations',
    meta: { title: 'Observations' },
    name: 'Observations',
    component: Observations,
  },
  {
    path: '/studies/:studyId/interventions',
    meta: { title: 'Interventions' },
    name: 'Interventions',
    component: Interventions,
  },
  {
    path: '/studies/:studyId/data',
    meta: { title: 'Data' },
    name: 'Data',
    component: Data,
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
