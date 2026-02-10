/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import { FrontendConfiguration } from '@gs';
  import Button from 'primevue/button';
  import AlertMsg from '../shared/AlertMsg.vue';
  import { useI18n } from 'vue-i18n';

  const dialogRef: any = inject('dialogRef');
  const title: string = dialogRef.value.data.title;
  const message: string = dialogRef.value.data.message;
  const token: string = dialogRef.value.data.highlightMsg;

  const uiConfig = inject<FrontendConfiguration>('uiConfig');
  const gatewayUrl = uiConfig?.gatewayUrl || window.location.origin;

  const { t } = useI18n();
  const showMessage: Ref<boolean> = ref(false);

  function copyToken(): void {
    navigator.clipboard.writeText(token);
    showMessage.value = true;
  }

  function closeDialog(): void {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="text-base">
    <h5 class="text-large mb-2 font-bold">{{ title }}</h5>
    <div class="mb-4">{{ message }}</div>
    <div class="h6 color-primary cursor-pointer font-medium" @click="copyToken">
      {{ token }}
    </div>

    <div class="mb-2 mt-6">
      <h6 class="mb-2 font-bold">
        {{ $t('interventionToken.dialog.example.endpointTitle') }}
      </h6>
      <div class="example-box mb-4 p-2">
        <table class="w-full text-sm">
          <tbody>
            <tr>
              <td class="w-20 p-1 font-semibold">Method</td>
              <td><code>POST</code></td>
            </tr>
            <tr>
              <td class="p-1 font-semibold">URL</td>
              <td><code>{{ gatewayUrl }}/api/v1/trigger/external</code></td>
            </tr>
            <tr>
              <td class="p-1 font-semibold">Header</td>
              <td><code>More-Api-Token: &lt;your-token&gt;</code></td>
            </tr>
            <tr>
              <td class="p-1 font-semibold">Body</td>
              <td><code>{"participantIds": [1, 2, ...]}</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h6 class="mb-2 font-bold">
        {{ $t('interventionToken.dialog.example.triggerTitle') }}
      </h6>
      <div class="example-box p-2">
        <code>
          <small>
            curl -X POST {{ gatewayUrl }}/api/v1/trigger/external \
            <br />
            -H "Content-Type: application/json" \
            <br />
            -H "More-Api-Token: {{ token }}" \
            <br />
            -d '{"participantIds": [1, 2]}'
          </small>
        </code>
      </div>
    </div>

    <div class="mt-8 flex flex-row items-center justify-end">
      <Button
        type="button"
        class="btn-gray"
        :label="$t('global.labels.close')"
        @click="closeDialog"
      />

      <Button
        type="button"
        class="p-button !ml-2"
        :label="$t('interventionToken.dialog.label.copyToken')"
        @click="copyToken"
      />
    </div>
  </div>

  <AlertMsg
    :show-msg="showMessage"
    :message="t('interventionToken.dialog.label.copySuccess')"
    type="msg"
    severity-type="success"
    style-modifier="msg-position"
    @on-msg-change="showMessage = false"
  />
</template>

<style scoped lang="postcss">
  .example-box {
    border: 1px solid var(--surface-50);
    border-radius: 6px;
    background-color: var(--surface-50);
  }

  .msg-position {
    height: fit-content;
  }
</style>
