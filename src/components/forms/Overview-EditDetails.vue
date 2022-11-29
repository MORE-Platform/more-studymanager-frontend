<script setup lang="ts">
  import {PropType} from 'vue';
  import {Study, StudyStatus} from '../../generated-sources/openapi/'
  import StudyDialog from '../../components/dialog/StudyDialog.vue'
  import {useDialog} from "primevue/usedialog";
  import Button from "primevue/button";
  import DynamicDialog from 'primevue/dynamicdialog';
  import StudyStatusChange from './StudyStatusChange.vue';
  import dayjs from 'dayjs'

  const dialog = useDialog();

  const props = defineProps({
    study: {type: Object as PropType<Study>, required: true},
    styleModifier: {type: String, default: ''}
  })

  const emit = defineEmits<{
    (e: 'onUpdateStudy', study: Study) : void,
    (e: 'onUpdateStudyStatus', status: StudyStatus) : void
  }>()


  function updateStudy(study:Study) {
     emit('onUpdateStudy', study)
  }

  function updateStudyStatus(status:StudyStatus) {
    emit('onUpdateStudyStatus', status)
  }

  function openEditDialog() {
    dialog.open(StudyDialog,{
      data: {
        study: props.study,
      },
      props: {
        header: 'Edit Study',
        style: {
          width: '50vw',
        },
        breakpoints:{
          '960px': '75vw',
          '640px': '90vw'
        },
        modal: true,
      },
      onClose: (options) => {
        if(options) {
          updateStudy(options.data as Study)
        }
      }
    })
  }


</script>

<template>
  <div class="overview-edit-details" :class="styleModifier">

    <div class="flex justify-start mb-8">
      <div class="study-info-fixed grid grid-cols-3  2xl:grid-cols-5 gap-x-6 py-3" style="width:89%;">
        <div><span class="font-bold">{{$t('plannedStart')}}: </span>{{dayjs(study.plannedStart).format("DD/MM/YYYY")}}</div>
        <div><span class="font-bold">{{$t('actualStart')}}: </span>
          <span v-if="study.start">{{dayjs(study.start).format("DD/MM/YYYY")}}</span><span v-else>-</span>
        </div>
        <div><span class="font-bold">{{$t('plannedEnd')}}: </span>{{dayjs(study.plannedEnd).format("DD/MM/YYYY")}}</div>
        <div> <span class="font-bold">{{$t('actualEnd')}}: </span>
          <span v-if="study.end">{{dayjs(study.end).format("DD/MM/YYYY")}}</span><span v-else>-</span>
        </div>
        <!--<div><span class="font-bold">{{$t('language')}}: </span> {{study.language}}</div>  -->
      </div>
      <div class="flex">
      <StudyStatusChange :status="study.status" @onchange="updateStudyStatus"></StudyStatusChange>
      <Button
        class="buttons"
        type="button"
        title="Edit Study Details" @click="openEditDialog()"><span>Edit</span></Button>
      </div>
    </div>

    <div class="mb-6">
      <h5>{{$t('purpose')}}</h5>
      <div>
        <span v-if="study.purpose">{{study.purpose}}</span>
        <span v-else>Enter information about the {{$t('purpose')}}</span>
      </div>
    </div>
    <div class="mb-6">
      <h5>{{$t('participantInfo')}}</h5>
      <div>
        <span v-if="study.participantInfo">{{study.participantInfo}}</span>
        <span v-else>Enter information about the {{$t('participantInfo')}}</span>
      </div>
    </div>
    <div class="mb-6">
      <h5>{{$t('consentInfo')}}</h5>
      <div>
        <span v-if="study.consentInfo">{{study.consentInfo}}</span>
        <span v-else>Enter information about the {{$t('consentInfo')}}</span>
      </div>
    </div>
  </div>
  <DynamicDialog />
</template>

<style lang="postcss">
h5 {
  font-size: 18px;
  font-weight: bold;
}
button.edit-btn {
  border: none;
  background-color: transparent;
  padding: 0!important;

  span:before {
    color: black;
  }

  &:hover, &:active, &:focus {
    background-color: lightgrey!important;
    span:before {
      color: var(--primary-color);
    }
  }
}
</style>
