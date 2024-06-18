/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import StudyList from '../components/StudyList.vue';
  import User from '../components/User.vue';
  import { useDialog } from 'primevue/usedialog';
  import InfoDialog from '../components/dialog/InfoDialog.vue';
  import { useUserStore } from '../stores/userStore';
  import { useI18n } from 'vue-i18n';

  const userStore = useUserStore();
  const dialog = useDialog();
  const { t } = useI18n();

  userStore.getUser().then(() => openWelcomeMessage());

  function openWelcomeMessage() {
    const storageItem = localStorage.getItem('welcomeMsg');
    if (userStore.user?.uid && !storageItem) {
      dialog.open(InfoDialog, {
        data: {
          message: t('welcomeMessage', {
            userName: userStore.userName,
            userInstitution: userStore.userInstitution,
          }),
        },
        props: {
          header: t('welcomeToMore'),
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
          localStorage.setItem('welcomeMsg', 'hide');
        },
      });
    }
  }
</script>

<template>
  <div class="container m-auto mt-10 rounded-lg bg-white p-10">
    <User v-if="userStore.user"></User>
    <StudyList class="mt-10" />
  </div>
</template>
