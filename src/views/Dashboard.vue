<script setup lang="ts">
  import StudyList from '../components/StudyList.vue'
  import User from '../components/User.vue'
  import {useUsersApi} from "../composable/useApi";
  import {ref, Ref} from "vue";
  import {UserInfo} from '../generated-sources/openapi/models/user-info';
  import {AxiosResponse} from "axios";

  const { usersApi } = useUsersApi()

  const user: Ref<UserInfo | undefined> =ref()

  async function getUser(): Promise<void> {
    try {
       user.value = await usersApi.getCurrentUser()
         .then((response:AxiosResponse) => response.data)
    } catch(e) {
      console.error('cannot read user', e)
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
  </div>
</template>
