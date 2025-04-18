<script setup lang="ts">
  import { useErrorQueue } from '../../../composable/useErrorHandling';
  import { Contact } from '../../../generated-sources';
  import ErrorLabel from '../../forms/ErrorLabel.vue';
  import InputText from 'primevue/inputtext';
  import { computed } from 'vue';

  const { clearError, errors } = useErrorQueue();
  const contact = defineModel<Contact>({ required: true });
  const contactLabels = [
    'contactInfo',
    'contactEmail',
    'contactPerson',
    'contactTel',
  ];
  const contactErrors = computed<string>(
    () =>
      errors.value?.find((error) => contactLabels.includes(error.label))
        ?.value || '',
  );

  const clearContactErrors = (): void => clearError(contactLabels);
</script>

<template>
  <div class="col-span-6 mb-4 mt-2">
    <h5 class="mb-2 text-lg font-bold">
      {{ $t('study.dialog.label.contactInfo') }}*
    </h5>
    <div class="mb-3">
      {{ $t('study.dialog.description.contactData') }}
    </div>
    <div class="grid grid-cols-6 gap-4">
      <div class="col-span-3">
        <h6 class="mb-1 font-medium">
          {{ $t('study.dialog.label.institute') }}
        </h6>
        <InputText
          v-model="contact.institute"
          class="w-full"
          type="text"
          :placeholder="$t('study.placeholder.institute')"
        />
      </div>
      <div class="col-span-3">
        <h6 class="mb-1 font-medium">
          {{ $t('study.dialog.label.contactPerson') }}*
        </h6>
        <InputText
          v-model="contact.person"
          required
          type="text"
          class="w-full"
          :placeholder="$t('study.placeholder.contactPerson')"
          @input="clearContactErrors"
        />
      </div>
      <div class="col-span-3">
        <h6 class="mb-1 font-medium">
          {{ $t('study.dialog.label.contactEmail') }}*
        </h6>
        <InputText
          v-model="contact.email"
          class="w-full"
          required
          type="email"
          :placeholder="$t('study.placeholder.contactEmail')"
          @input="clearContactErrors"
        />
      </div>
      <div class="col-span-3">
        <h6 class="mb-1 font-medium">
          {{ $t('study.dialog.label.contactTel') }}
        </h6>
        <InputText
          v-model="contact.phoneNumber"
          class="w-full"
          type="tel"
          :placeholder="$t('study.placeholder.contactTel')"
          @input="clearContactErrors"
        />
      </div>
    </div>
    <ErrorLabel :error="contactErrors" class="col-span-8" />
  </div>
</template>
