/* * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more *
contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute * for
Digital Health and Prevention -- A research institute of the * Ludwig Boltzmann
Gesellschaft, Oesterreichische Vereinigung zur * Foerderung der
wissenschaftlichen Forschung). * Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { RouteParamsRaw, useRoute, useRouter } from 'vue-router';
  import { StudyRole } from '../../generated-sources/openapi';
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
      name: t('studyNavigation.tabLink.overview'),
      params: { studyId: props.studyId },
      access: [StudyRole.Admin, StudyRole.Operator, StudyRole.Viewer],
    },
    {
      title: t('studyNavigation.tabs.participants'),
      name: t('studyNavigation.tabLink.participants'),
      params: { studyId: props.studyId },
      access: [StudyRole.Admin, StudyRole.Operator],
    },
    {
      title: t('studyNavigation.tabs.observations'),
      name: t('studyNavigation.tabLink.observations'),
      params: { studyId: props.studyId },
      access: [StudyRole.Admin, StudyRole.Operator],
    },
    {
      title: t('studyNavigation.tabs.integration'),
      name: t('studyNavigation.tabLink.integration'),
      params: { studyId: props.studyId },
      access: [StudyRole.Admin, StudyRole.Operator],
    },
    {
      title: t('studyNavigation.tabs.interventions'),
      name: t('studyNavigation.tabLink.interventions'),
      params: { studyId: props.studyId },
      access: [StudyRole.Admin, StudyRole.Operator],
    },
    {
      title: t('studyNavigation.tabs.data'),
      name: t('studyNavigation.tabLink.data'),
      params: { studyId: props.studyId },
      access: [StudyRole.Viewer, StudyRole.Admin],
    },
  ] as Tab[];

  const studyRoleValues: MoreTableChoice[] = [
    { label: t('study.roles.admin'), value: StudyRole.Admin },
    { label: t('study.roles.operator'), value: StudyRole.Operator },
    { label: t('study.roles.viewer'), value: StudyRole.Viewer },
  ];

  const activeTab = tabs.find((r) => r.name === route.name);
  const access: Ref<boolean> = ref(false);
  if (activeTab) {
    access.value = props.studyRoles.some((r) => activeTab.access.includes(r));
  }

  function getAccess() {
    if (activeTab) {
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
  }

  function getDialogMsg(activeTab: Tab) {
    const msg: Ref<string> = ref(
      activeTab.name + t('studyNavigation.accessDialog.accessInformation')
    );
    activeTab.access.forEach((r, index) => {
      const role: MoreTableChoice = studyRoleValues.find(
        (l) => l.value === r
      ) as MoreTableChoice;
      if (index > 0 && activeTab.access.length > 1) {
        msg.value = msg.value + ', ';
      }
      msg.value = msg.value + '"' + role.label + '"';
      if (index === activeTab.access.length - 1) {
        msg.value =
          msg.value + t('studyNavigation.accessDialog.permissionWarningMsg');
      }
    });
    return msg.value;
  }

  function getVisible(accessRoles: StudyRole[]) {
    return props.studyRoles.some((r) => accessRoles.includes(r));
  }

  function setActiveTab() {
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
  <div class="more-tab-nav mb-16">
    <div
      class="tab-parent flex flex-wrap justify-end border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
    >
      <div v-for="tab in tabs" :key="tab.name">
        <div
          class="tab tab-element mr-0.5"
          :class="!getVisible(tab.access) ? 'tab-inactive' : ''"
        >
          <a
            href="#"
            class="inline-block rounded-t-lg p-4"
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
      font-size: 1.125rem;

      .tab-element {
        a {
          padding: 1rem 1.375rem;
          border: 0.063rem solid var(--bluegray-200);
        }
      }
    }

    .bg-blue-500 {
      background-color: var(--primary-color) !important;
      border-bottom: 2px solid var(--bluegray-200) !important;
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
