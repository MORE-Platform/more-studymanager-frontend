<script setup lang="ts">
  import StudyList from '../components/StudyList.vue'
  import User from '../components/User.vue'
  import {useUsersApi} from "../composable/useApi";
  import {ref, Ref} from "vue";
  import {UserInfo} from '../generated-sources/openapi/models/user-info';
  import {AxiosResponse} from "axios";
  import {useDialog} from "primevue/usedialog";
  import DynamicDialog from "primevue/dynamicdialog";
  import InfoDialog from "../components/dialog/InfoDialog.vue";

  const { usersApi } = useUsersApi()
  const dialog = useDialog()

  const user: Ref<UserInfo | undefined> =ref()

  async function getUser(): Promise<void> {
    try {
       user.value = await usersApi.getCurrentUser()
         .then((response:AxiosResponse) =>
         { openWelcomeMessage(response.data)
           return response.data
         })
    } catch(e) {
      console.error('cannot read user', e)
    }
  }

  function openWelcomeMessage(user: UserInfo | undefined) {
    const storageItem = localStorage.getItem('welcomeMsg');

    if (user && !storageItem) {
      const msg = 'Dear ' + user.name + ' ' + (user.institution) + ', welcome to your Dashboard of the MORE project. Start by creating a new study or managing existing studies you have been assigned to collaborate on.'
      dialog.open(InfoDialog,{
        data: {
          message: msg
        },
        props: {
          header: "Welcome to More",
          style: {
            width: '50vw',
          },
          breakpoints:{
            '960px': '75vw',
            '640px': '90vw'
          },
          modal: true,
        },
        onClose: () => {
          localStorage.setItem('welcomeMsg', 'hide');
        }
      })
    }
  }

  getUser();
</script>

<template>
  <div class="container bg-white rounded-lg m-auto p-10 mt-10">
    <div v-if="user">
      <User :user="user"></User>
    </div>
    <div class="mt-10">
      <StudyList />
    </div>
    <DynamicDialog />
  </div>
</template>
