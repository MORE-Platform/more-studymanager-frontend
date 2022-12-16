<script setup lang="ts">
import {RouteParamsRaw, useRoute, useRouter} from 'vue-router';
import {StudyRole} from "../../generated-sources/openapi";
import {PropType, ref, Ref} from "vue";
import InfoDialog from "../dialog/InfoDialog.vue";
import {useDialog} from "primevue/usedialog";
import AccessDialog from 'primevue/dynamicdialog';
import {MoreTableChoice} from "../../models/MoreTableModel";

const accessDialog = useDialog()

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

  interface Tab {
    title: string
    name: string
    params: RouteParamsRaw
    active?: boolean
    access: StudyRole[]
  }

  const router = useRouter()
  const route = useRoute()

  const tabs:Tab[] = [
    {title: 'Overview', name: 'Overview', params: {studyId: props.studyId}, access: [StudyRole.Admin, StudyRole.Operator, StudyRole.Viewer]},
    {title: 'Data', name: 'Data', params: {studyId: props.studyId}, access: [StudyRole.Viewer]},
    {title: 'Participants', name: 'Participants', params: {studyId: props.studyId}, access: [StudyRole.Admin, StudyRole.Operator]},
    {title: 'Observations', name: 'Observations', params: {studyId: props.studyId}, access: [StudyRole.Admin, StudyRole.Operator]},
    {title: 'Interventions', name: 'Interventions', params: {studyId: props.studyId}, access: [StudyRole.Admin, StudyRole.Operator]}
  ] as Tab[]

const studyRoleValues: MoreTableChoice[] = [
  {label: 'Study Administrator', value: StudyRole.Admin},
  {label: 'Study Operator', value: StudyRole.Operator},
  {label: 'Study Viewer', value: StudyRole.Viewer}
]

  const activeTab = tabs.find(r => r.name === route.name);
  const access: Ref<boolean> = ref(false);
  if (activeTab)    {
      access.value =  props.studyRoles.some(r => activeTab.access.includes(r));
  }

  function getAccess() {
    if(activeTab) {
      const msg = getDialogMsg(activeTab)

      if(!access.value) {
        accessDialog.open(InfoDialog, {
          data: {
            message: msg
          },
          props: {
            header: "Access Denied",
            style: {
              width: '50vw',
            },
            breakpoints:{
              '960px': '75vw',
              '640px': '90vw'
            },
          },
          onClose: () => {
            console.log("closed access dialog")
          }
        })
      }
    }
  }


  function getDialogMsg(activeTab: Tab) {
    const msg: Ref<string> = ref("Access to the " + activeTab.name + "-section requires ")
    activeTab.access.forEach((r, index) => {
      const role: MoreTableChoice = studyRoleValues.find((l) => l.value === r) as MoreTableChoice
      if (index > 0 && activeTab.access.length > 1) { msg.value = msg.value + ', '; }
      msg.value = msg.value + '"' + role.label + '"-';
      if(index === activeTab.access.length -1)  {msg.value = msg.value + "Permission. Please contact your study-administrator if you require access to this section." }
    })
    return msg.value;
  }

  function getVisible(accessRoles: StudyRole[]) {
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
  setTimeout(function() {
    getAccess()
  }, 100)
</script>

<template>
  <div class="mb-16 more-tab-nav">
    <div class="flex flex-wrap justify-end text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 tab-parent">
      <div v-for="tab in tabs" :key="tab.name" >
        <div class="tab mr-0.5 tab-element" :class="!getVisible(tab.access) ? 'tab-inactive' : ''" >
          <a
            href="#"
            class="inline-block p-4 rounded-t-lg"
            :class="!getVisible(tab.access) ? 'bg-gray-200 text-gray-400' : {'cursor-default': tab.active, 'text-white': tab.active, 'bg-blue-500': tab.active, 'scale-110 origin-bottom z-50 hover:text-white': tab.active, 'hover:text-gray-600': !tab.active, 'hover:bg-gray-50': !tab.active}"
            @click="goto(tab)"
          >{{tab.title}}</a>
        </div>
      </div>
    </div>
    <div v-if="!access">
      <AccessDialog />
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

    .tab-inactive {
      pointer-events: none;
      a {
        font-size: calc(var(--default-font-size) / 0.8)!important;
        font-weight: 350;
      }

    }
  }
</style>
