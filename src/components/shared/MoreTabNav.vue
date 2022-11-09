<script setup lang="ts">
import {useRoute, useRouter} from 'vue-router';

  interface Tab {
    title: string
    name: string
    params: any
    active?: boolean
  }

  const router = useRouter()
  const route = useRoute()

  const props = defineProps({
    studyId: {
      type: Number,
      required: true
    }
  });

  const tabs:Tab[] = [
    {title: 'Overview', name: 'Overview', params: {studyId: props.studyId}},
    {title: 'Data', name: 'Data', params: {studyId: props.studyId}},
    {title: 'Participants', name: 'Participants', params: {studyId: props.studyId}}
  ] as Tab[]

  function equals(obj1:any, obj2:any) {
    return JSON.stringify(obj1) === JSON.stringify(obj2)
  }

  function setActiveTab() {
    tabs.forEach((tab:Tab) => {
      tab.active = (tab.name === route.name && equals(tab.params, route.params));
    })
  }

  function goto(tab:Tab): void {
    router.push({ name: tab.name, params: tab.params })
  }

  setActiveTab();

  console.log(tabs);
</script>

<template>
  <div>
    <ul class="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
      <li class="tab mr-2" v-for="tab in tabs">
        <a
          href="#"
          class="inline-block p-4 rounded-t-lg"
          :class="{'cursor-default': tab.active, 'text-blue-600': tab.active, 'bg-gray-100': tab.active, 'hover:text-gray-600': !tab.active, 'hover:bg-gray-50': !tab.active}"
          @click="goto(tab)"
        >{{tab.title}}</a>
      </li>
    </ul>
  </div>
</template>

<style lang="postcss">
</style>
