<script setup lang="ts">
import {RouteParamsRaw, useRoute, useRouter} from 'vue-router';
import {StudyRole, StudyStatus} from "../../generated-sources/openapi";
import {PropType, ref, Ref} from "vue";

const props = defineProps({
  studyId: {
    type: Number,
    required: true
  },
  studyRoles: {
    type: Array as PropType<Array<StudyRole>>,
    required: true
  }
});

console.log("MoreTableNav");
console.log(props.studyId);
console.log(props.studyRoles);
console.log("----------------------")

  interface Tab {
    title: string
    name: string
    params: RouteParamsRaw
    active?: boolean
    access?: StudyRole[]
  }

  const router = useRouter()
  const route = useRoute()

  const tabs:Tab[] = [
    {title: 'Overview', name: 'Overview', params: {studyId: props.studyId}, access: [StudyRole.Admin, StudyRole.Operator]},
    {title: 'Data', name: 'Data', params: {studyId: props.studyId}, access: [StudyRole.Viewer]},
    {title: 'Participants', name: 'Participants', params: {studyId: props.studyId}, access: [StudyRole.Admin, StudyRole.Operator]},
    {title: 'Observations', name: 'Observations', params: {studyId: props.studyId}, access: [StudyRole.Admin, StudyRole.Operator]},
    {title: 'Interventions', name: 'Interventions', params: {studyId: props.studyId}, access: [StudyRole.Admin, StudyRole.Operator]}
  ] as Tab[]

  function getVisible(accessRoles: StudyRole[], title: string) {
    return(props.studyRoles.some(r => accessRoles.includes(r)));
  }

  function setActiveTab() {
    tabs.forEach((tab:Tab) => {
      tab.active = (tab.name === route.name);
    })
  }

  function goto(tab:Tab): void {
    router.push({ name: tab.name, params: tab.params })
  }

  setActiveTab();
</script>

<template>
  <div class="mb-16 more-tab-nav">
    <div class="flex flex-wrap justify-end text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 tab-parent">
      <div v-for="tab in tabs" :key="tab.name" >
        <div class="tab mr-0.5 tab-element" v-if="getVisible(tab.access, tab.title)">
          <a
            href="#"
            class="inline-block p-4 rounded-t-lg"
            :class="{'cursor-default': tab.active, 'text-white': tab.active, 'bg-blue-500': tab.active, 'scale-110 origin-bottom z-50 hover:text-white': tab.active, 'hover:text-gray-600': !tab.active, 'hover:bg-gray-50': !tab.active}"
            @click="goto(tab)"
          >{{tab.title}}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
  .more-tab-nav {
    margin-top: -0.938rem;
    .tab-parent {
      font-size: 1.125rem;

      .tab-element {
        a {
          padding: 1rem 1.375rem;
          border: 0.063rem solid var(--bluegray-200);;
        }
      }
    }

    .bg-blue-500{
      background-color: var(--primary-color)!important;
    }
  }
</style>
