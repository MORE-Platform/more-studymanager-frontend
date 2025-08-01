/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { RouteParamsRaw, useRoute, useRouter } from 'vue-router';
  import { StudyRole } from '@gs';
  import { PropType, ref, Ref } from 'vue';
  import InfoDialog from '../dialog/InfoDialog.vue';
  import { useDialog } from 'primevue/usedialog';
  import AccessDialog from 'primevue/dynamicdialog';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import { useI18n } from 'vue-i18n';

  const accessDialog = useDialog();
  const { t } = useI18n();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
    studyRoles: {
      type: Array as PropType<Array<StudyRole>>,
      required: true,
    },
  });

  interface Tab {
    title: string;
    name: string;
    params: RouteParamsRaw;
    active?: boolean;
    access: StudyRole[];
  }

  const router = useRouter();
  const route = useRoute();

  const tabs: Tab[] = [
    {
      title: t('studyNavigation.tabs.overview'),
      name: 'Overview',
      params: { studyId: props.studyId },
      access: [
        StudyRole.StudyAdmin,
        StudyRole.StudyOperator,
        StudyRole.StudyViewer,
      ],
    },
    {
      title: t('studyNavigation.tabs.participants'),
      name: 'Participants',
      params: { studyId: props.studyId },
      access: [StudyRole.StudyAdmin, StudyRole.StudyOperator],
    },
    {
      title: t('studyNavigation.tabs.observations'),
      name: 'Observations',
      params: { studyId: props.studyId },
      access: [StudyRole.StudyAdmin, StudyRole.StudyOperator],
    },
    {
      title: t('studyNavigation.tabs.integration'),
      name: 'Integrations',
      params: { studyId: props.studyId },
      access: [StudyRole.StudyAdmin, StudyRole.StudyOperator],
    },
    {
      title: t('studyNavigation.tabs.interventions'),
      name: 'Interventions',
      params: { studyId: props.studyId },
      access: [StudyRole.StudyAdmin, StudyRole.StudyOperator],
    },
    {
      title: t('studyNavigation.tabs.timeline'),
      name: 'Timeline',
      params: { studyId: props.studyId },
      access: [StudyRole.StudyAdmin, StudyRole.StudyOperator],
    },
    {
      title: t('studyNavigation.tabs.monitoringAndData'),
      name: 'Monitoring & Data',
      params: { studyId: props.studyId },
      access: [StudyRole.StudyAdmin, StudyRole.StudyViewer],
    },
  ] as Tab[];

  const studyRoleValues: MoreTableChoice[] = [
    { label: t('study.roles.admin'), value: StudyRole.StudyAdmin },
    { label: t('study.roles.operator'), value: StudyRole.StudyOperator },
    { label: t('study.roles.viewer'), value: StudyRole.StudyViewer },
  ];

  const activeTab = tabs.find((t) => t.name === route.name);
  const access: Ref<boolean> = ref(false);
  if (activeTab) {
    access.value = props.studyRoles.some((r) => activeTab.access.includes(r));
  }

  function getAccess(): void {
    if (!activeTab) {
      return;
    }

    const msg = getDialogMsg(activeTab);

    if (!access.value) {
      accessDialog.open(InfoDialog, {
        data: {
          message: msg,
        },
        props: {
          header: t('studyNavigation.accessDialog.header'),
          style: {
            width: '50vw',
          },
          breakpoints: {
            '960px': '75vw',
            '640px': '90vw',
          },
          modal: true,
          draggable: false,
        },
        onClose: () => {
          console.log('closed access dialog');
        },
      });
    }
  }

  function getDialogMsg(activeTab: Tab): string {
    let msg: string =
      activeTab.name + t('studyNavigation.accessDialog.accessInformation');

    activeTab.access.forEach((r, index) => {
      const role: MoreTableChoice = studyRoleValues.find(
        (l) => l.value === r,
      ) as MoreTableChoice;
      if (index > 0 && activeTab.access.length > 1) {
        msg = `${msg}, `;
      }
      msg = `${msg}"${role.label}"`;

      if (index === activeTab.access.length - 1) {
        msg = msg + t('studyNavigation.accessDialog.permissionWarningMsg');
      }
    });
    return msg;
  }

  function getVisible(accessRoles: StudyRole[]): boolean {
    return props.studyRoles.some((r) => accessRoles.includes(r));
  }

  function setActiveTab(): void {
    tabs.forEach((tab: Tab) => {
      tab.active = tab.name === route.name;
    });
  }

  function goto(tab: Tab): void {
    router.push({ name: tab.name, params: tab.params });
  }

  setActiveTab();
  setTimeout(function () {
    getAccess();
  }, 100);
</script>

<template>
  <div class="more-tab-nav mb-10">
    <div
      class="tab-parent flex flex-wrap justify-end text-center text-lg font-medium leading-5 text-gray-500 dark:text-gray-400"
    >
      <div v-for="tab in tabs" :key="tab.name">
        <div
          class="tab tab-element mr-0.5"
          :class="{ 'tab-inactive': !getVisible(tab.access) }"
        >
          <a
            href="#"
            class="inline-block rounded-t-lg px-4 py-3"
            :class="
              !getVisible(tab.access)
                ? 'bg-gray-200 text-gray-400'
                : {
                    'cursor-default': tab.active,
                    'text-white': tab.active,
                    'bg-blue-500': tab.active,
                    'z-50 origin-bottom scale-110 hover:text-white': tab.active,
                    'hover:text-gray-600': !tab.active,
                    'hover:bg-gray-50': !tab.active,
                  }
            "
            @click="goto(tab)"
            >{{ tab.title }}</a
          >
        </div>
      </div>
    </div>
    <div v-if="!access">
      <AccessDialog />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .more-tab-nav {
    margin-top: -0.938rem;
    .tab-parent {
      border-bottom: 1px solid var(--primary-color);
      .tab-element {
        a {
          border: 0.063rem solid var(--bluegray-200);
        }
      }
    }

    .bg-blue-500 {
      background-color: var(--primary-color) !important;
    }

    .tab-inactive {
      pointer-events: none;
      a {
        font-size: calc(var(--default-font-size) / 0.8) !important;
        font-weight: 350;
      }
    }
  }
</style>
