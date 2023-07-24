import { createRouter, createWebHistory } from 'vue-router';

//Routes
import Dashboard from '../views/Dashboard.vue';
import NotFound from '../views/NotFound.vue';
import Interventions from '../views/Interventions.vue';
import Participants from '../views/Participants.vue';
import Observations from '../views/Observations.vue';
import Data from '../views/Data.vue';
import StudyOverview from '../views/StudyOverview.vue';
import { useStudyStore } from '../stores/studyStore';
import { useStudyGroupStore } from '../stores/studyGroupStore';
import Integrations from '../views/Integrations.vue';
import DataDownload from '../views/DataDownload.vue';

const studyResolver = async (to: any, from: any, next: any) => {
  const studyStore = useStudyStore();
  const studyGroupStore = useStudyGroupStore();
  if (
    !studyStore.study.studyId ||
    studyStore.study.studyId !== to.params.studyId
  ) {
    await studyStore.getStudy(to.params.studyId);
    await studyGroupStore.getStudyGroups(to.params.studyId);
  }
  next();
};
const routes = [
  {
    path: '/',
    meta: { title: 'Dashboard' },
    component: Dashboard,
  },
  {
    path: '/studies/:studyId',
    beforeEnter: studyResolver,
    children: [
      {
        path: '',
        name: 'Overview',
        meta: { title: 'Overview' },
        component: StudyOverview,
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
        path: 'monitoring',
        meta: { title: 'Monitoring' },
        name: 'Monitoring',
        component: Data,
      },
      {
        path: 'integrations',
        meta: { title: 'Integrations' },
        name: 'Integrations',
        component: Integrations,
      },
      {
        path: 'dataDownload',
        meta: { title: 'Data' },
        name: 'Data',
        component: DataDownload,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound,
  },
];

export const Router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  history: createWebHistory(),
  routes,
});
