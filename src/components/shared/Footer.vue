/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, ref } from 'vue';
  import {
    BuildInfo,
    FrontendConfiguration,
  } from '../../generated-sources/openapi';
  import OverlayPanel from 'primevue/overlaypanel';

  const uiConfig = inject('uiConfig') as FrontendConfiguration;
  const buildInfo = inject('buildInfo') as {
    frontend: BuildInfo;
    backend: BuildInfo;
  };
  const buildInfoPanel = ref();
</script>

<template>
  <footer class="footer z-1000 w-full">
    <div class="content-block mx-24 my-2 flex justify-between">
      <div>
        <OverlayPanel ref="buildInfoPanel">
          <div class="w-25rem flex flex-col gap-3">
            <div
              v-for="(info, tier) in buildInfo"
              :key="tier"
              class="build-info"
            >
              <div class="font-bold capitalize">{{ tier }}:</div>
              <div class="build-info">
                <span class="build-info_git">
                  {{ info.branch || '' }}@{{ info.rev || '?' }}
                </span>
                <span class="build-info_date">
                  ({{ new Date(info.date).toISOString() }})
                </span>
              </div>
            </div>
          </div>
        </OverlayPanel>
        <i class="pi pi-info-circle link" @click="buildInfoPanel.toggle"></i>
        {{ uiConfig.title }}
      </div>
      <a
        href="https://dhp.lbg.ac.at/more/"
        target="_blank"
        class="link text-base uppercase"
        >{{ $t('global.footer.aboutMore') }}</a
      >
    </div>
  </footer>
</template>

<style scoped lang="postcss">
  .footer {
    z-index: 1000;
    position: fixed;
    left: 0;
    bottom: 0;
    background-color: white;
    width: 100%;

    &:before {
      content: '';
      height: 100%;
      width: 100%;
      box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1);
      transform: rotate(180deg);
      position: absolute;
      top: 0;
      left: 0;
    }

    .link {
      position: relative;
      z-index: 100;
    }
  }

  .build-info_git {
    font-family: monospace;
  }
</style>
