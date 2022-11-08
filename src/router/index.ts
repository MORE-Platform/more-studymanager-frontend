import { createRouter, createWebHistory } from 'vue-router'

//Routes
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'
import Study from '../views/Study.vue'
import StudyGroup from '../views/StudyGroup.vue'
import Participants from '../views/Participants.vue'

const routes = [
  {
    path: '/',
    meta: { title: 'Home' },
    component: Dashboard,
  },
  {
    path: '/studies/:studyId',
    meta: { title: 'Study' },
    name: 'Study',
    component: Study,
  },
  {
    path: '/studies/:studyId/participants',
    meta: { title: 'Participants' },
    name: 'Participants',
    component: Participants,
  },
  {
    path: '/studies/:studyId/groups/:groupId',
    meta: { title: 'StudyGroup' },
    name: 'StudyGroup',
    component: StudyGroup,
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
