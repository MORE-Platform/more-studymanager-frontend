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
  <div class="container m-auto mt-10">
    <User :user="user"></User>
  </div>
  <div class="container m-auto mt-10">
    <StudyList />
  </div>
</template>
