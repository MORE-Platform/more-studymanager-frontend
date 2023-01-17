<script setup lang="ts">
  import { useStudyStore } from '../stores/studyStore';
  const studyStore = useStudyStore();
  //TODO change to proxy
  const baseUrl = import.meta.env.VITE_LOCAL_BACKEND
    ? 'http://localhost:8080/'
    : 'https://kibana.platform-test.more.redlink.io/';
  const kibanaUrl =
    baseUrl +
    /*eslint-disable */
    "kibana/app/dashboards#/view/90b3d4d0-6ef9-11ed-9d37-37f3957fa3f8?embed=true&_g=(filters:!(),refreshInterval:(pause:!f,value:5000),time:(from:now-10m,to:now))&_a=(controlGroupInput:(chainingSystem:HIERARCHICAL,controlStyle:oneLine,defaultControlGrow:!t,defaultControlWidth:medium,ignoreParentSettings:(ignoreFilters:!f,ignoreQuery:!f,ignoreTimerange:!f,ignoreValidations:!f),panels:('9cfc434d-e484-42fc-b8f6-c38640b859cf':(explicitInput:(dataViewId:'2eec98e0-6b1b-11ed-9d37-37f3957fa3f8',enhancements:(),fieldName:study_group_id.keyword,id:'9cfc434d-e484-42fc-b8f6-c38640b859cf',parentFieldName:study_group_id,selectedOptions:!(),title:'Study%20Group'),grow:!t,order:0,type:optionsListControl,width:medium),f4000877-8e14-4c21-8b24-17ed3aaf4f00:(explicitInput:(dataViewId:'2eec98e0-6b1b-11ed-9d37-37f3957fa3f8',enhancements:(),fieldName:participant_id.keyword,id:f4000877-8e14-4c21-8b24-17ed3aaf4f00,parentFieldName:participant_id,selectedOptions:!(),title:Participant),grow:!t,order:1,type:optionsListControl,width:medium))),description:'',filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'2eec98e0-6b1b-11ed-9d37-37f3957fa3f8',key:study_id,negate:!f,params:(query:study_"+studyStore.study.studyId+"),type:phrase),query:(match_phrase:(study_id:study_"+studyStore.study.studyId+")))),fullScreenMode:!f,options:(hidePanelTitles:!f,syncColors:!f,syncTooltips:!f,useMargins:!t),panels:!((embeddableConfig:(enhancements:()),gridData:(h:8,i:'627c68dc-cd2a-4819-8a69-93b4a47dc8e3',w:48,x:0,y:0),id:aa7a9b40-6fe1-11ed-9d37-37f3957fa3f8,panelIndex:'627c68dc-cd2a-4819-8a69-93b4a47dc8e3',type:lens,version:'8.3.2'),(embeddableConfig:(enhancements:()),gridData:(h:8,i:'9f301ea1-df73-4362-bdd5-1335cd5d9c14',w:48,x:0,y:8),id:bb075450-6f2b-11ed-9d37-37f3957fa3f8,panelIndex:'9f301ea1-df73-4362-bdd5-1335cd5d9c14',type:lens,version:'8.3.2'),(embeddableConfig:(enhancements:()),gridData:(h:7,i:'7e7514d0-b956-4e22-a17f-2e374ccca0f9',w:48,x:0,y:16),id:d6fb21e0-6f2c-11ed-9d37-37f3957fa3f8,panelIndex:'7e7514d0-b956-4e22-a17f-2e374ccca0f9',type:lens,version:'8.3.2')),query:(language:kuery,query:''),tags:!(),timeRange:(from:now-60m,to:now),timeRestore:!t,title:'LIVE%20data%20dashboard',viewMode:view)&show-time-filter=true&hide-filter-bar=true";
    /*eslint-enable */
</script>

<template>
  <div class="dataview container m-auto mt-10">
    <iframe :src="kibanaUrl" style="width: 100%; height: 800px"></iframe>
  </div>
</template>

<style scoped lang="postcss">
  .dataview {
    a {
      color: var(--primary-color);
      font-weight: 500;
    }
  }
</style>
