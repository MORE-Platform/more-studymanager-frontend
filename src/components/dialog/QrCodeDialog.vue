/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, onMounted, Ref, ref } from 'vue';
  import { Participant } from '@gs';
  import QrcodeVue from 'qrcode.vue';
  import type { Level, RenderAs, GradientType } from 'qrcode.vue';
  import Button from 'primevue/button';
  import SplitButton from 'primevue/splitbutton';
  import { MenuItem } from 'primevue/menuitem';
  import Message from 'primevue/message';
  import AlertMsg from '../shared/AlertMsg.vue';
  import { useI18n } from 'vue-i18n';
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

  const showMessage: Ref<boolean> = ref(false);

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
        .catch(console.error);
      showMessage.value = true;
    }
  };

  const getQRCodeAsImg = (): void => {
    const canvas: HTMLCanvasElement | null = document.querySelector(`${renderAs.value}#${id}`);
    const container: HTMLElement | null = document.getElementById('qr-code-as-img');

    if (canvas && container) {
      container.innerHTML = ''

      const img = document.createElement('img')
      img.src = canvas.toDataURL('image/png')
      img.style.width = canvas.style.width
      img.style.height = canvas.style.height

      container.appendChild(img)
    }
  }

  const download = async (format: DownloadType = 'jpg'): void => {
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

  onMounted(() => {
    /* this guarantees that the qr code is rendered correctly when opening the pdf view */
    getQRCodeAsImg()
  })
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

    <AlertMsg
      :show-msg="showMessage"
      :message="t('participants.dialog.msg.alert')"
      class="qr-code-message"
      type="msg"
      severity-type="success"
      style-modifier="msg-position"
      @on-msg-change="showMessage = false"
    />
  </div>

  <!-- give the print view a seperate section, to control layout more efficiently -->
  <div class="print-qr-code-container hidden">
    <div class="font-bold mb-3 text-lg">{{ $t('participants.dialog.header.qrCode') }} {{ participant.alias }}</div>
    <div class="mb-1.5"> {{ $t('participants.dialog.msg.qrCode', { part: participant.alias }) }}</div>
    <div id="qr-code-as-img"></div>
    <div id="qr-code-link mt-1.5">{{ registrationUrl }}</div>
  </div>
</template>
