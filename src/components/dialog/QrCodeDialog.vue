/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { inject, onMounted, ref } from 'vue';
  import { Participant } from '@gs';
  import type { GradientType, Level, RenderAs } from 'qrcode.vue';
  import QrcodeVue from 'qrcode.vue';
  import Button from 'primevue/button';
  import SplitButton from 'primevue/splitbutton';
  import { MenuItem } from 'primevue/menuitem';
  import Message from 'primevue/message';
  import { useI18n } from 'vue-i18n';
  import { useToast } from 'primevue/usetoast';

  type DownloadType = 'jpg' | 'png' | 'pdf';

  const { t } = useI18n();
  const dialogRef: any = inject('dialogRef');
  const participant: Participant = dialogRef.value.data?.participant || {};
  const id = `qr-code-${participant?.participantId || ''}`;
  const registrationUrl = ref<string>(
    URL.parse(participant?.registrationUrl || '')?.toString() || '',
  );
  const level = ref<Level>('M');
  const renderAs = ref<RenderAs>('canvas');
  const background = ref('#ffffff');
  const foreground = ref('#000000');
  const margin = ref(1);
  const gradient = ref(false);
  const gradientType = ref<GradientType>('linear');
  const gradientStartColor = ref('#000000');
  const gradientEndColor = ref('#38bdf8');
  const toast = useToast();

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

  const copy = (): void => {
    if (registrationUrl.value && navigator?.clipboard) {
      navigator.clipboard
        .writeText(registrationUrl.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('global.labels.success'),
            detail: t('participants.dialog.header.alert'),
            life: 2000,
          });
        })
        .catch(console.error);
    }
  };

  const getQRCodeAsImg = (): void => {
    const canvas: HTMLCanvasElement | null = document.querySelector(
      `${renderAs.value}#${id}`,
    );
    const container: HTMLElement | null =
      document.getElementById('qr-code-as-img');

    if (canvas && container) {
      container.innerHTML = '';

      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = canvas.style.width;
      img.style.height = canvas.style.height;

      container.appendChild(img);
    }
  };

  const download = (format: DownloadType = 'jpg'): void => {
    if (format === 'jpg' || format === 'png') {
      const canvas: HTMLCanvasElement | null = document.querySelector(
        `${renderAs.value}#${id}`,
      );
      if (canvas) {
        const link = document.createElement('a');

        link.download = `qr-code-${participant?.alias?.replaceAll(' ', '-')}.${format}`;
        link.href = canvas?.toDataURL(`image/${format}`) || '';
        link.click();
      }
    } else {
      window.print();
    }
  };

  /* this guarantees that the qr code is rendered correctly when opening the pdf view */
  onMounted(getQRCodeAsImg);
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
      @click.prevent="download()"
    />
  </div>

  <!-- give the print view a seperate section, to control layout more efficiently -->
  <div class="print-qr-code-container mt-0 ml-8 hidden">
    <div class="mb-1.5 text-lg font-bold">
      {{ $t('participants.dialog.header.qrCode') }} {{ participant.alias }}
    </div>
    <div>
      {{ $t('participants.dialog.msg.qrCode', { part: participant.alias }) }}
    </div>
    <div class="my-2"><span id="qr-code-as-img"></span></div>
    <div id="qr-code-link">{{ registrationUrl }}</div>
  </div>
</template>
