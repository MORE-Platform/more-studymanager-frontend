<script setup lang="ts">
  import { PushNotificationObject } from '../../../models/InterventionTriggerModel';
  import { ref, Ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';

  const { t } = useI18n();

  const props = defineProps({
    notificationString: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    actionTypeName: {
      type: String,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    (e: 'onPropsChange', notificationString: string): void;
  }>();

  // eslint-disable-next-line no-undef
  const pushNotificationObj: Ref<PushNotificationObject> = ref(
    props.notificationString
      ? JSON.parse(props.notificationString)
      : { title: null, message: null }
  );

  function updateProperties() {
    console.log(JSON.stringify(pushNotificationObj.value));
    emit('onPropsChange', JSON.stringify(pushNotificationObj.value));
  }
</script>

<template>
  <div class="action-property-input grid grid-cols-5 gap-4">
    <div class="col-span-5">
      <h6>
        {{ $t('intervention.dialog.label.pushNotification') }}
      </h6>
      <div>{{ description }}</div>
    </div>

    <label id="action-title" class="col-span-1 font-bold">{{
      t('study.props.title')
    }}</label>
    <InputText
      v-model="pushNotificationObj.title"
      for="action-title"
      type="text"
      :placeholder="t('intervention.dialog.placeholder.title')"
      class="col-span-4"
      :disabled="!editable"
      @change="updateProperties"
    />

    <label id="action-msg" class="col-span-1 font-bold"
      >{{ t('global.labels.message') }}
    </label>
    <Textarea
      v-model="pushNotificationObj.message"
      for="action-msg"
      class="col-span-4"
      type="text"
      :placeholder="t('intervention.dialog.placeholder.message')"
      :disabled="!editable"
      @change="updateProperties"
    />
  </div>
</template>
