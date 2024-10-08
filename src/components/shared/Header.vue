/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import AuthService from '../../service/AuthService';
  import ProgressBar from 'primevue/progressbar';
  import useLoader from '../../composable/useLoader';
  import { useRoute } from 'vue-router';
  import { useStudyStore } from '../../stores/studyStore';

  const studyStore = useStudyStore();
  const route = useRoute();
  const auth = inject('authService') as AuthService;

  const loading = useLoader().isLoading;
  function logout(): void {
    auth.logout();
  }

  function checkRoute(routeName: string): boolean {
    return routeName === route.meta.title;
  }
</script>

<template>
  <header
    class="more-header py-2 shadow-md"
    :class="[{ [studyStore.studyStatus]: !checkRoute('Dashboard') }]"
  >
    <div class="container m-auto flex justify-between px-10">
      <router-link to="/">
        <div class="logo cursor-pointer">
          <svg
            id="Liniengrafik"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 493.2 215.4"
            style="enable-background: new 0 0 493.2 215.4"
            xml:space="preserve"
          >
            <g>
              <path
                d="M180.8,121.9c-0.4-0.2-0.8-0.2-1.2-0.2c-5.1,0.2-10.6,0.5-15.6,0.1c-0.8-0.1-1.2-0.2-1.4-0.6l0,0.1l-0.3-1
      c-0.7-1.8-0.6-4.3-1.2-6.4c-0.2-0.8-0.8-2-1.7-2.4c-0.6-0.4-1.6-0.4-2.3-0.2c-0.7,0.3-0.9,0.5-1.2,0.8c-1.1,1.2-1.2,2.7-1.5,4
      c-0.3,1.6-0.8,4.9-1,6.5c-0.1,0.3-0.1,0.7-0.2,1.1c-0.8-5.2-1.5-10.5-2-15.7c-0.2-1.8-0.2-3.6-1.6-5.3c-0.2-0.3-0.6-0.6-1.2-0.9
      c-1-0.5-2.5-0.1-3.2,0.5c-1.5,1.2-2.1,3-2.6,4.7c-0.1,0.1-0.1,0.2-0.1,0.2v0h0c0,0,0,0,0,0v0l0,0c-0.1,0.2-0.1,0.4-0.1,0.5
      c-0.4,2.2-0.9,5.6-1.2,7.8c-0.5,2.8-0.6,5.8-1.4,8.4c-0.4-0.6-0.8-1.1-1.4-1.6c-1.5-1.5-4.3-1.3-5.5,0.5c-0.7,1.1-1,2.1-1.1,3.1
      c-0.5,0.8-0.7,1.7-0.9,2.6c-0.9,4.1-1.4,8.5-2,12.8c-2.8-14.9-5.6-29.9-7.7-44.8c-1.3-8.5-2-17-3.3-25.5c-0.6-3.4-0.9-6.6-2.1-10
      c-0.4-1.3-1.7-2.8-3.4-2.7c-1.4,0.2-1.9,0.7-2.5,1.5c-1.4,2.9-1.2,6.3-1.6,9.2c-0.6,14-2.9,28.8-5,43.2c-0.9,5.7-1.9,11.3-3.1,16.9
      l-0.8-3.4l-0.1-0.5c-1-1.5-2.5-3.5-4.7-3.6c-0.6,0-1.4,0-2.2-0.1c-0.3-2.7-0.7-6.5-1-9.1c-0.2-1.4-0.3-3.4-1.7-4.7
      c-1.4-1.3-3.8-0.8-4.7,0.6c-0.9,1.3-0.8,2-1.2,3.2c-0.7,3.1-1.4,6.4-2,9.5c0-0.1,0,0.1,0,0.1c0,0.2-0.1,0.4-0.2,0.5
      c0,0.1,0,0.1-0.1,0.1h-0.1c-7.7,0.3-15.4,0.7-23,1.8c-1.1,0.2-0.9,1.7,0,1.8c4.6,0.7,9.3,1.1,13.9,1.4c2.9,0.2,5.8,0.3,8.7,0.4
      c0.9,0.1,1.9,0,2.8-0.4c1.4-0.6,2.3-1.6,2.8-2.8c0.5,1.5,1.4,2.9,3.1,3.3c0.5,0.1,0.9,0.1,1.3,0.1c0.7,0,2-0.1,2.9-0.1
      c0.1,0.1,0.1,0.1,0.2,0.2c0.3,1.1,2.3,9.4,2.5,10.3c-0.2,1.7-0.5,3.4-0.5,5.2c0,0.4,0.1,1,0.4,1.6c0.8,1.5,3.1,1.8,4.2,0.8
      c0.6-0.5,0.9-1.1,1.1-1.7c3.3-10,5.1-20.5,6.8-30.8c1.8-11.7,3.3-23.4,4.5-35.2c0.8,6.5,1.4,13,2.4,19.4c2.4,17,5.5,33.9,8.9,50.7
      c0.2,1.4,0.3,2.7,0.8,4.3c0.3,1,1,2.6,2.2,3c4.6,1.5,5.3-4.9,5.9-7.9c1-5.7,1.4-11.6,2.7-17.2c0.3-0.1,0.6-0.4,0.7-0.8
      c0.2,0.2,0.5,0.4,0.8,0.6c1.4,1.1,4,1.1,5.3-0.4c2.4-2.8,2.4-5.9,2.9-9.1c0.1-1,0.4-2.6,0.6-4.1c0.1,0.4,0.1,0.7,0.1,1.1
      c0.8,6.2,1.8,12.3,2.8,18.4c0.4,1.6,0.6,3,2.6,3.8c4.2,1,4.8-4.5,5.3-7.4c0,0,0.7-4.5,1.1-7c2.4,2.7,7,2.5,10.5,2.4
      c2.6,0,5.1-0.1,7.6-0.2c-2,6.3-4.8,12.4-8.4,18c-1.2,1.7-2.4,3.6-3.7,5.2l-2.7,3.2c-0.7,1-2.1,2.1-2.9,3.1c-1.9,2-4.2,3.9-6.4,5.6
      c-0.6,0.5-3.7,2.7-4.3,3.1c-1.3,0.8-3.2,1.9-4.5,2.8c-1.9,1-3.8,1.9-5.7,2.9C91.2,191.8,39,158,38.8,106.9
      c-0.3-23.1,11.3-45.6,30-59.3c0.4-0.3,0.5-0.8,0.2-1.2c-0.3-0.4-0.8-0.6-1.3-0.3C57.6,52.3,49,61.3,43,71.9
      c-33.7,61.8,27.5,130.9,93.2,106.6c3.4-1.3,7.3-3.1,10.4-4.9c1.4-0.9,3.5-2.1,4.9-3c0.6-0.5,3.9-2.9,4.6-3.4c1.8-1.4,3.5-3,5.2-4.5
      c0.8-0.8,2.4-2.5,3.2-3.3c2.5-2.6,5.2-6,7.2-9c5.3-7.5,8.9-16.2,11.1-25.1C183.3,123.4,182.1,122.2,180.8,121.9L180.8,121.9z
       M81.7,121.7L81.7,121.7C81.7,121.7,81.7,121.7,81.7,121.7C81.7,121.7,81.8,121.7,81.7,121.7z M90,111.8L90,111.8
      C90,111.8,90,111.7,90,111.8z M93.7,127.1c0,0,0.1,0,0.1,0.1C93.8,127.2,93.7,127.2,93.7,127.1z M131.6,127.5L131.6,127.5
      C131.6,127.5,131.6,127.5,131.6,127.5z M132.7,129.5c0.2,0.1,0.5,0.2,0.8,0.4C133.2,129.8,133,129.6,132.7,129.5z M137.1,127
      c0-0.1,0-0.3,0-0.4C137.5,126.9,137.6,127.1,137.1,127z"
              />
              <path
                d="M294.7,82.6c-4.1-3.7-9.6-5.5-16.4-5.5s-12.3,1.8-16.4,5.5c-4.1,3.7-6.2,9-6.4,15.9c0,1.5-0.1,3.8-0.1,6.7s0,5.1,0.1,6.6
      c0.2,7.1,2.3,12.4,6.2,16c4,3.6,9.5,5.4,16.5,5.4s12.6-1.8,16.5-5.4c4-3.6,6.1-8.9,6.3-16c0.1-3,0.2-5.2,0.2-6.6s0-3.7-0.2-6.7
      C300.9,91.6,298.8,86.3,294.7,82.6z M290,111.5c-0.2,4.3-1.3,7.5-3.4,9.6c-2.1,2.1-4.9,3.2-8.4,3.2s-6.2-1.1-8.3-3.2
      c-2-2.1-3.2-5.3-3.3-9.6c0-1.6-0.1-3.7-0.1-6.3s0-4.8,0.1-6.3c0.2-4.3,1.3-7.5,3.4-9.6c2.1-2.1,4.8-3.2,8.3-3.2s6.3,1.1,8.4,3.2
      c2.1,2.1,3.2,5.3,3.4,9.6c0.1,3,0.2,5.1,0.2,6.3C290.1,106.3,290.1,108.4,290,111.5L290,111.5z"
              />
              <path
                d="M343.5,110.1c3.3-1.1,5.8-3,7.7-5.6c1.9-2.6,2.8-5.8,2.8-9.6c0-5.5-1.8-9.7-5.4-12.6c-3.6-3-8.6-4.4-14.9-4.4h-20.2
      c-0.6,0-1,0.2-1.4,0.6c-0.3,0.4-0.5,0.8-0.5,1.4v50.8c0,0.5,0.2,1,0.5,1.3c0.4,0.4,0.8,0.6,1.3,0.6h7.1c0.6,0,1-0.2,1.4-0.6
      c0.3-0.4,0.5-0.8,0.5-1.3v-18.7h10.8l10.1,18.5c0.4,0.7,0.8,1.2,1.2,1.6s1.1,0.6,1.9,0.6h7.1c0.4,0,0.8-0.2,1.1-0.5
      s0.5-0.7,0.5-1.2c0-0.3-0.1-0.6-0.2-0.9L343.5,110.1L343.5,110.1z M340.4,101c-1.6,1.4-3.9,2.1-7.1,2.1h-11V86.5h11
      c3.1,0,5.5,0.7,7.1,2.2c1.6,1.5,2.4,3.5,2.4,6.2S342,99.6,340.4,101L340.4,101z"
              />
              <path
                d="M486.7,128.1l-26.5-13.4l3,8.8h-9.4V101c0,0,0-1.4-1.6-1.4h-6.6c-1.9,0-1.6,1.2-1.6,1.2v22.6h-5.6V94.4c0,0,0-1.8-1.6-1.8
      h-6.6c-1.9,0-1.6,1.6-1.6,1.6v29.3h-5.6v-17.2c0,0,0-1.1-1.6-1.1h-6.6c-1.9,0-1.6,1-1.6,1v17.4h-39v-14.3h24c0.6,0,1-0.2,1.4-0.5
      s0.5-0.8,0.5-1.4v-4.8c0-0.6-0.2-1-0.5-1.4c-0.4-0.3-0.8-0.5-1.4-0.5h-24V86.8h25.7c0.6,0,1-0.2,1.4-0.5s0.5-0.8,0.5-1.4v-5.2
      c0-0.6-0.2-1-0.5-1.4c-0.4-0.4-0.8-0.6-1.4-0.6h-34.3c-0.6,0-1,0.2-1.4,0.6c-0.3,0.4-0.5,0.8-0.5,1.4v50.8c0,0.5,0.2,1,0.5,1.3
      c0.4,0.4,0.8,0.6,1.3,0.6h95.4l-2.7,5.3L486.7,128.1L486.7,128.1z"
              />
              <path
                d="M244.6,78.4c-0.4-0.4-0.8-0.6-1.4-0.6h-6.1c-1,0-1.8,0.5-2.3,1.5l-15.2,28.1l-16.1-28.1c-0.5-1-1.2-1.5-2.3-1.5H196
      c-0.6,0-1,0.2-1.4,0.6c-0.4,0.4-0.6,0.8-0.6,1.4v50.8c0,0.2,0,0.3,0,0.4c-0.1,2.8-0.3,6.5-0.3,6.5l-0.3,6.4c-0.1,1.1-0.7,3.7-1,4.4
      c-31.9,67.1-126.3,71.8-165.3,8C4.3,119.4,10.8,68.8,42.4,39c18.6-18.1,44.2-27.6,70-28.5c1.2-0.1,1.3-1.8,0.1-2
      C76.2,3.3,39,24.2,20.8,55.5c-41.4,69.7,12.5,157.1,93.3,152c36.3-1.9,71.7-25.2,87.2-57.9c0.3-0.6,0.8-1.6,1-4.9s1.1-48,1.1-48
      l11.9,20.8c0.7,1.1,1.6,1.7,2.6,1.7h3.2c1.1,0,2-0.6,2.6-1.7l10.9-20.8v33.8c0,0.5,0.2,1,0.5,1.3c0.4,0.4,0.8,0.6,1.3,0.6h6.5
      c0.6,0,1-0.2,1.4-0.5s0.5-0.8,0.5-1.4V79.8C245.1,79.3,245,78.8,244.6,78.4L244.6,78.4z"
              />
            </g>
          </svg>
        </div>
      </router-link>
      <div class="flex items-center justify-between">
        <div
          class="back-to-dashboard"
          :class="{ active: checkRoute('Dashboard') }"
        >
          <router-link to="/">
            <div class="border-0 bg-transparent font-bold">
              {{ $t('global.header.backToDashboard') }}
            </div>
          </router-link>
        </div>
        <div class="user logout flex">
          <button class="border-0 bg-transparent font-bold" @click="logout()">
            {{ $t('global.header.logout') }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loader">
      <ProgressBar mode="indeterminate" class="!h-2 !rounded-none" />
    </div>
  </header>
</template>

<style scoped lang="postcss">
  header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: white;
    z-index: 1000;

    &.draft,
    &.preview,
    &.paused-preview,
    &.active,
    &.paused,
    &.closed {
      border-bottom: 2px solid;
    }

    &.draft {
      border-color: var(--gray-400);
    }
    &.preview {
      border-color: var(--green-400);
      border-style: dashed;
    }
    &.paused-preview {
      border-color: var(--red-400);
      border-style: dashed;
    }
    &.active {
      border-color: var(--green-400);
    }
    &.paused {
      border-color: var(--red-400);
    }
    &.closed {
      border-color: var(--blue-400);
    }

    .loader {
      position: fixed;
      z-index: 1000;
      width: 100%;
      top: 62px;
    }

    .logo {
      svg {
        transition: ease-in-out 0.2s;
        fill: var(--primary-color);
      }

      &:hover svg {
        fill: var(--primary-700);
      }
    }
    .logo svg,
    .user svg {
      height: 2.813rem;
      width: auto;
    }
    .logout,
    .back-to-dashboard {
      color: var(--text-color);
      padding: 0 7px;

      a,
      button {
        color: var(--text-color);
        position: relative;

        &:hover,
        &:active,
        &:focus {
          color: var(--primary-color);

          &:after {
            opacity: 1;
          }
        }

        &:after {
          position: absolute;
          content: '';
          height: 2px;
          width: 100%;
          background-color: var(--primary-color);
          bottom: 0;
          left: 0;
          opacity: 0;
        }
      }

      &.active {
        a,
        button {
          color: var(--primary-color);

          &:after {
            opacity: 1;
          }
        }
      }
    }
  }
</style>
