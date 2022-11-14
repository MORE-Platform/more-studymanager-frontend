<script setup lang="ts">
  import StudyList from '../components/StudyList.vue'
  import User from '../components/User.vue'
  import {UserModel} from '../models/UserModel';

  const user:UserModel = {
    name: 'Dr. Max Mustermann',
    organisation: 'Research Institute X'
  }
</script>

<template>
  <div class="container bg-white rounded-lg m-auto p-10 mt-10">
    <div>
      <User :user="user"></User>
    </div>
    <div class="mt-10">
      <StudyList />
    </div>
  </div>
</template>
