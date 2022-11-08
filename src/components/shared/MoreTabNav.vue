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

  const tabsLeft:Tab[] = [
    {title: 'Overview', name: 'Study', params: {studyId: '3'}},
    {title: 'Group 1', name: 'StudyGroup', params: {studyId: '3', groupId: '1'}},
  ] as Tab[]

  const tabsRight = [
    {title: 'Participants', name: 'Participants', params: {studyId: '3'}}
  ] as Tab[]

  function equals(obj1:any, obj2:any) {
    return JSON.stringify(obj1) === JSON.stringify(obj2)
  }

  function setActiveTab() {
    [...tabsLeft, ...tabsRight].forEach((tab:Tab) => {
      tab.active = (tab.name === route.name && equals(tab.params, route.params));
    })
  }

  function goto(tab:Tab): void {
    router.push({ name: tab.name, params: tab.params })
  }

  setActiveTab();
</script>

<template>
  <div class="tabnav">
    <div class="tabnav-left">
      <div class="tab" v-for="tab in tabsLeft" :class="{ active: tab.active }" @click="goto(tab)">{{tab.title}}</div>
    </div>
    <div class="tabnav-right">
      <div class="tab" v-for="tab in tabsRight" :class="{ active: tab.active }" @click="goto(tab)">{{tab.title}}</div>
    </div>
  </div>
</template>

<style lang="postcss">
  .tab {
    text-decoration: underline;
    cursor: pointer;
  }
  .tab.active {
    color: red;
    text-decoration: none;
    cursor: default;
  }
</style>
