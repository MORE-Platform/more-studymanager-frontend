import { createRouter, createWebHistory } from 'vue-router'

//Routes
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'
import Study from '../views/Overview.vue'
import Interventions from '../views/Interventions.vue'
import Participants from '../views/Participants.vue'
import Observations from '../views/Observations.vue'
import Data from '../views/Data.vue'
import {useStudiesApi} from '../composable/useApi';

const {studiesApi} = useStudiesApi()

const studyResolver = async (to:any, from:any, next: any) => {
  to.meta['study'] = await studiesApi.getStudy(to.params.studyId).then((response) => response.data)
  next()
}

const routes = [
  {
    path: '/',
    meta: { title: 'Dashboard' },
    component: Dashboard
  },
  {
    path: '/studies/:studyId',
    beforeEnter: studyResolver,
    children: [
      {
        path: '',
        name: 'Overview',
        meta: { title: 'Overview' },
        component: Study
      },
      {
        path: 'participants',
        name: 'Participants',
        meta: { title: 'Participants' },
        component: Participants,
      },
      {
        path: 'observations',
        meta: { title: 'Observations' },
        name: 'Observations',
        component: Observations,
      },
      {
        path: 'interventions',
        meta: { title: 'Interventions' },
        name: 'Interventions',
        component: Interventions,
      },
      {
        path: 'data',
        meta: { title: 'Data' },
        name: 'Data',
        component: Data,
      },
    ]
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

Router.beforeEach((to:any, from:any) => {
  to.meta['study'] = from.meta['study']
});
