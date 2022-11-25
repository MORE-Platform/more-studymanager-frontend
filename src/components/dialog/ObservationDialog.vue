<script setup lang="ts">
import {inject, ref, Ref} from 'vue';
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import {Observation, Event, Frequency} from '../../generated-sources/openapi';
import {MoreTableChoice} from "../../models/MoreTableModel";
import Scheduler from "../shared/Scheduler.vue"
import {useDialog} from "primevue/usedialog";

const dialog = useDialog()

const dialogRef:any = inject("dialogRef")
const observation = dialogRef.value.data.observation as Observation;
const groupStates = dialogRef.value.data.groupStates || [];
const typeName = dialogRef.value.data.typeName || observation.type;

const title = ref(observation.title);
const purpose = ref(observation.purpose);
const participantInfo = ref(observation.participantInfo)
const properties = ref(observation.properties ? JSON.stringify(observation.properties) : '{}');
const scheduler: Ref<Event> = ref(observation.schedule ? observation.schedule : {})
const studyGroupId = ref(observation.studyGroupId)

const jsonError: Ref<string>= ref('')

function getLabelForChoiceValue(value: any, values: MoreTableChoice[]) {
  if(value) {
    const v = value.toString()
    return values.find((s: any) => s.value === v)?.label;
  }
    return undefined;
}


function openScheduler() {
  dialog.open(Scheduler,{
    data: {
      scheduler: scheduler.value
    },
    props: {
      header: 'Manage Schedule',
      style: {
        width: '50vw',
      },
      breakpoints:{
        '960px': '75vw',
        '640px': '90vw'
      },
      modal: true,
      dismissableMask: true,
    },
    onClose: (options) => {
      if(options?.data) {
        scheduler.value = options.data;
      }
    }
  })
}

function save(){
  try {
    const props = JSON.parse(properties.value.toString())

    const returnObservation = {
      observationId: observation.observationId,
      title: title.value,
      purpose: purpose.value,
      participantInfo: participantInfo.value,
      type: observation.type,
      properties: props,
      scheduler: scheduler.value,
      studyGroupId: studyGroupId.value
    } as Observation;

    dialogRef.value.close(returnObservation);
  } catch (e) {
    jsonError.value = 'Please enter a valid json inside the Config (Json) field.'
  }
}

  function cancel() {
   dialogRef.value.close();
  }

  function getFrequencyLabel(frequency: Frequency) {
    switch(frequency) {
      case Frequency.Hourly: return 'hour(s)';
      case Frequency.Daily: return 'day(s)';
      case Frequency.Weekly: return 'week(s)';
      case Frequency.Monthly: return 'month(s)';
      case Frequency.Yearly: return 'year(s)';
    }
  }

  function getByMonthDayLabel(monthDay: number) {
    if (monthDay > 3 && monthDay < 21) return 'th';
    switch (monthDay % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  }

  function getMonthLabel(month: number) {
    switch(month) {
      case 1:  return "January";
      case 2:  return "February";
      case 3:  return "March";
      case 4:  return "April";
      case 5:  return "Mai";
      case 6:  return "June";
      case 7:  return "July";
      case 8:  return "August";
      case 9:  return "September";
      case 10:  return "October";
      case 11:  return "November";
      case 12:  return "Dezember";
    }
  }

  function getByStepPosLabel(setPos: number) {
    switch(setPos) {
      case 1: return 'first';
      case 2: return 'second';
      case 3: return 'third';
      case 4: return 'fourth';
      case -1: return 'last';
    }
  }
</script>

<template>
  <div class="observation-dialog">
    <div class="mb-4"><span class="font-bold">Type: </span> {{ typeName }}</div>
   <div class="grid grid-cols-8 gap-4 items-center">
     <div class="col-start-0 col-span-2"><h5>{{ $t('observation') }} {{ $t('title') }}</h5></div>
     <div class="col-start-3 col-span-6">
       <InputText v-model="title" placeholder="Enter the study title." style="width: 100%"></InputText>
     </div>
     <div class="col-start-0 col-span-8 grid grid-cols-8">
       <h5 class="col-start-0 col-span-8">Scheduler</h5>
       <div class="col-start-0 col-span-8 grid grid-cols-7 gap-4 justify-center items-center">

         <div class="col-span-5">
          <div v-if="scheduler.dtstart" class="grid grid-cols-2 gap-x-4 gap-y-1">
            <div><span class="font-medium">{{ $t('end') }}: </span>{{scheduler.dtstart}}</div>
            <div><span class="font-medium">{{$t('end')}}: </span>{{scheduler.dtend}}</div>

            <div v-if="scheduler.rrule.freq" class="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <div><span class="font-medium">Frequency: </span>{{scheduler.rrule.freq}}</div>
              <div>Each {{scheduler.rrule.interval}} {{getFrequencyLabel(scheduler.rrule.freq)}}</div>
              <div v-if="scheduler.rrule.bymonthday && scheduler.rrule.freq === Frequency.Monthly" class="col-start-2 col-span-1" >Every {{scheduler.rrule.bymonthday}}{{getByMonthDayLabel(scheduler.rrule.bymonthday)}}</div>
              <div v-if="scheduler.rrule.bysetpos && scheduler.rrule.freq === Frequency.Monthly" class="col-start-2 col-span-1">Every {{getByStepPosLabel(scheduler.rrule.bysetpos)}} <span v-for="(day, index) in scheduler.rrule.byday" :key="index" class="day mr-2">{{day}}</span></div>
              <div v-if=" scheduler.rrule.freq === Frequency.Yearly" class="col-start-2 col-span-1">Every
                <span v-if="scheduler.rrule.bymonthday">{{scheduler.rrule.bymonthday}}{{getByMonthDayLabel(scheduler.rrule.bymonthday)}}</span>
                <span v-if="scheduler.rrule.byday"><span v-for="(day, index) in scheduler.rrule.byday" :key="index" class="day">{{day}}</span> in </span>
                {{getMonthLabel(scheduler.rrule.bymonth)}}</div>
            </div>

            <div v-if="scheduler.rrule.byday && !scheduler.rrule.bysetpos" class="col-span-2">
              <span class="font-medium">Days selected: </span>
              <span v-for="(day, index) in scheduler.rrule.byday" :key="index" class="day mr-2">
                {{day}}
              </span>
            </div>

            <div v-if="scheduler.rrule.count" class="col-span-2">
              <span class="font-medium">Repetition end:</span> after {{scheduler.rrule.count / scheduler.rrule?.byday}} {{getFrequencyLabel(scheduler.rrule.freq)}}
            </div>
            <div v-if="scheduler.rrule.until" class="col-span-2">
              <span class="font-medium">Repetition end: </span> on {{scheduler.rrule.until}}
            </div>
          </div>
           <div v-else>Enter Schedule</div>
         </div>

         <Button class="col-span-2 justify-center" type="button" @click="openScheduler">Open Scheduler</Button>
         </div>

     </div>
    <div class="col-start-0 col-span-8">
      <h5 class="mb-2">{{ $t('purpose') }}</h5>
      <Textarea v-model="purpose" placeholder="Enter the main purpose and intention of the study." :auto-resize="true" style="width: 100%"></Textarea>
    </div>
    <div class="col-start-0 col-span-8">
      <h5 class="mb-2">{{ $t('participantInfo') }}</h5>
      <Textarea v-model="participantInfo" placeholder="Enter the participant information, which will be displayed on the app." :auto-resize="true" style="width: 100%"></Textarea>
    </div>
    <div class="col-start-0 col-span-8">
      <h5 class="mb-2">Configuration</h5>
      <div v-if="jsonError" class="error mb-3">{{jsonError}}</div>
      <div class="col-start-0 col-span-8">
        <h6 class="mb-1">Config(Json)</h6>
        <Textarea v-model="properties" placeholder="Enter the main purpose and intention of the study." :auto-resize="true" style="width: 100%"></Textarea>
      </div>
    </div>

     <div class="col-start-0 col-span-8">
       <Dropdown v-model="studyGroupId" :options="groupStates" option-label="label" option-value="value" :placeholder="getLabelForChoiceValue(studyGroupId, groupStates) || $t('noGroup')">
       </Dropdown>
     </div>

  <div class=" col-start-0 col-span-8 buttons text-right mt-8 justify-end">
    <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
    <Button @click="save()">Save</Button>
  </div>

   </div>
  </div>
</template>


<style lang="postcss">
.observation-dialog {
  .buttons {
    button {
      margin-left: 10px;
    }
  }

  .error {
    color: #D57575;

  }
}

</style>
