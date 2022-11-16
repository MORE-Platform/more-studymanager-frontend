<script setup lang="ts">
  import {ref, Ref, PropType} from 'vue';
  import { Study } from '../../generated-sources/openapi/'
  import EditStudyProp from '../shared/EditStudyProp.vue'


  const props = defineProps({
    study: {type: Object as PropType<Study>, required: true},
    styleModifier: {type: String, default: ''}
  })

  const updatedStudy: Ref<Study> = ref({
    studyId: props.study.studyId,
    title: props.study.title,
    purpose: props.study.purpose,
    participantInfo: props.study.participantInfo,
    consentInfo: props.study.consentInfo,
    plannedStart: props.study.plannedStart,
    plannedEnd: props.study.plannedEnd
  })

  const emit = defineEmits<{
    (e: 'onUpdateStudy', study: Study) : void
  }>()

  function onFieldSave(value: string, type: string) {
    console.log("onFieldSave");
    if(type === 'purpose') {
      updatedStudy.value.purpose = value;
    } else if (type === 'participantInfo') {
      updatedStudy.value.participantInfo = value
    } else if (type === 'consentInfo') {
      updatedStudy.value.consentInfo = value
    }  else {
      return
    }
    emit('onUpdateStudy', updatedStudy.value);
  }


</script>

<template>
  <div class="overview-edit-details" :class="styleModifier">
    <EditStudyProp
      :style-modifier="'mb-6'"
      :title="$t('purpose')"
      :prop-field="'purpose'"
      :study-prop="updatedStudy.purpose"
      :study-status="study.status"
      @on-save-prop="onFieldSave($event, 'purpose')" />
    <EditStudyProp
      :style-modifier="'mb-6'"
      :title="$t('participantInfo')"
      :prop-field="'participantInfo'"
      :study-prop="updatedStudy.participantInfo"
      :study-status="study.status"
      @on-save-prop="onFieldSave($event, 'participantInfo') " />
    <EditStudyProp
      :style-modifier="'mb-6'"
      :title="$t('consentInfo')"
      :prop-field="'consentInfo'"
      :study-prop="updatedStudy.consentInfo"
      :study-status="study.status"
      @on-save-prop="onFieldSave($event, 'consentInfo')" />
  </div>
</template>
