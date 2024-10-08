/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  const props = defineProps({
    token: {
      type: String,
      default: 'ef1e9877-7ab1-49b7-bf7e-b35952cfa32c',
    },
  });
</script>

<template>
  <div class="integration-example">
    <h6 class="mb-2 mt-6 font-bold">
      {{ $t('integration.dialog.example.title') }}
    </h6>
    <div class="example-box mb-4 p-2">
      <h6 class="mb-1.5 font-bold">
        {{ $t('integration.dialog.example.dataTitle') }}
      </h6>
      <code class="mb-4">
        <small>
          curl -X POST
          <span class="color-primary font-medium">{{
            $t('integration.dialog.example.yourDomain')
          }}</span>
          \ <br />
          -H "Content-Type: application/json" \ <br />
          -H "More-Api-Token:
          <span class="color-primary font-medium">{{
            $t('integration.dialog.example.yourToken')
          }}</span
          >" \ <br />
          -d '{<span class="color-primary font-medium">
            {{ $t('integration.dialog.example.yourData') }} </span
          >}'
        </small>
      </code>
      <h6 class="mb-1.5 mt-5 font-bold">
        {{ $t('integration.dialog.example.filledExample') }}
      </h6>
      <code>
        <small>
          curl -X POST
          https://data.platform-test.more.redlink.io/api/v1/external/bulk \
          <br />
          -H "Content-Type: application/json" \ <br />
          -H "More-Api-Token: {{ props.token }}" \ <br />
          -d
          '{"participantId":"2","dataPoints":[{"dataId":"3","dataValue":{"value":1,"something":"sth"},"timestamp":"2023-05-23T11:55:05.366Z"}]}'
        </small>
      </code>
    </div>
    <div class="example-box mb-4 p-2">
      <h6 class="mb-1.5 font-bold">
        {{ $t('integration.dialog.example.participantsTitle') }}
      </h6>
      <code class="mb-4">
        <small>
          curl -X GET
          <span class="color-primary font-medium">{{
            $t('integration.dialog.example.yourDomain')
          }}</span>
          \ <br />
          -H "More-Api-Token:
          <span class="color-primary font-medium">
            {{ $t('integration.dialog.example.yourToken') }} </span
          >"
        </small>
      </code>
      <h6 class="mb-1.5 mt-5 font-bold">
        {{ $t('integration.dialog.example.filledExample') }}
      </h6>
      <code>
        <small>
          curl -X GET
          https://data.platform-test.more.redlink.io/api/v1/external/participants
          \ <br />
          -H "More-Api-Token: {{ props.token }}"
        </small>
      </code>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .integration-example .example-box {
    border: 1px solid var(--surface-50);
    border-radius: 6px;
    background-color: var(--surface-50);
  }
</style>
