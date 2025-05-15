/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, ref } from 'vue';
  import { Participant } from '@gs';
  import QrcodeVue from 'qrcode.vue';
  import type { Level, RenderAs, GradientType } from 'qrcode.vue';
  import Button from 'primevue/button';
  import SplitButton from 'primevue/splitbutton';
  import { MenuItem } from 'primevue/menuitem';

  const dialogRef: any = inject('dialogRef');
  const participant: Participant = dialogRef.value.data?.participant || {};
  const id = `qr-code-${participant?.participantId || ''}`;
  const registrationUrl: string =
    URL.parse(participant?.registrationUrl || '')?.toString() || '';
  const level = ref<Level>('M');
  const renderAs = ref<RenderAs>('canvas');
  const background = ref('#ffffff');
  const foreground = ref('#000000');
  const margin = ref(1);

  const gradient = ref(false);
  const gradientType = ref<GradientType>('linear');
  const gradientStartColor = ref('#000000');
  const gradientEndColor = ref('#38bdf8');

  const copy = (): void => {
    if (registrationUrl && navigator?.clipboard) {
      navigator.clipboard
        .writeText(registrationUrl)
        .catch(console.error);
    }
  };

  type DownloadType = 'jpg' | 'png' | 'pdf';

  const download = (format: DownloadType = 'jpg'): void => {
    if (format === 'jpg' || format === 'png') {
      const canvas: HTMLCanvasElement | null = document.querySelector(`${renderAs.value}#${id}`);
      if(canvas) {
        const link = document.createElement('a');

        link.download = `qr-code-${participant?.alias?.replaceAll(' ', '-')}.${format}`;
        link.href = canvas?.toDataURL(`image/${format}`) || '';
        link.click();
      }
    } else {
      window.print();
    }
  };

  const items: MenuItem[] = [
    {
      label: 'PNG',
      command: () => download('png'),
    },
    {
      label: 'PDF',
      command: () => download('pdf'),
    },
  ];
</script>

<template>
  <div
    v-if="registrationUrl"
    class="qr-code-container flex flex-col items-center justify-center gap-2"
  >
    <div class="qr-info max-w-[300px]">
      {{ $t('participants.dialog.msg.qrCode', { part: participant.alias }) }}
    </div>
    <QrcodeVue
      :id="id"
      class="my-4"
      :value="registrationUrl"
      :level="level"
      :render-as="renderAs"
      :background="background"
      :foreground="foreground"
      :gradient="gradient"
      :gradient-type="gradientType"
      :gradient-start-color="gradientStartColor"
      :gradient-end-color="gradientEndColor"
      :margin="margin"
    />
    <a
      v-tooltip.top="$t('participants.dialog.btn.copyLink')"
      :href="registrationUrl"
      target="_blank"
      class="max-w-[300px] text-wrap break-all"
      @click.prevent="copy"
      >{{ registrationUrl }}</a
    >
  </div>
  <Message v-else :severity="'error'">
    {{ $t('participants.dialog.error.qrcode') }}</Message
  >
  <div class="mt-4 flex flex-row items-center justify-center gap-2 text-right">
    <Button
      class="btn-gray"
      :label="$t('global.labels.close')"
      @click="dialogRef.close()"
    />
    <SplitButton
      :model="items"
      :label="$t('participants.dialog.btn.downloadQr')"
      type="button"
      :icon="'pi pi-download'"
      :disabled="!registrationUrl"
      @click="download()"
    />
  </div>
</template>
