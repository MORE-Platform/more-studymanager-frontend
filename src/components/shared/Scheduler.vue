<script setup lang="ts">
  import {inject, ref, Ref} from "vue";
  import Calendar from 'primevue/calendar'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import SelectButton from 'primevue/selectbutton';
  import {Frequency, Weekday} from '../../generated-sources/openapi';
  const dialogRef:any = inject("dialogRef")

  //const schedule:any = dialogRef.value.data.schedule;

  const start = ref(new Date());
  const end = ref(new Date());

  const repeatFreqArray = [
    {label: 'Never', value: null, active: true},
    {label: 'Hourly', value: Frequency.Hourly, active: true, unit: 'hour(s)'},
    {label: 'Daily', value: Frequency.Daily, active: true, unit: 'day(s)'},
    {label: 'Weekly', value: Frequency.Weekly, active: true, unit: 'week(s)'},
    {label: 'Monthly', value: Frequency.Monthly, active: true, unit: 'month(s)'},
    {label: 'Yearly', value: Frequency.Yearly, active: true, unit: 'year(s)'}
  ]
  const repeatWeekdayArray = [
    {label: 'MO', value: Weekday.Mo},
    {label: 'TU', value: Weekday.Tu},
    {label: 'WE', value: Weekday.We},
    {label: 'TH', value: Weekday.Th},
    {label: 'FR', value: Weekday.Fr},
    {label: 'SA', value: Weekday.Sa},
    {label: 'SO', value: Weekday.Su},
  ]
  const repeatYearOptionArray = [
    {label: 'On a specific day', value: 'onSpecific'},
    {label: 'On specific options', value: 'onOptions'}
  ]
  const repeatBySetPosOptionArray = [
    {label: 'First', value: 1},
    {label: 'Second', value: 2},
    {label: 'Third', value: 3},
    {label: 'Fourth', value: 4},
    {label: 'Last', value: -1}
  ]
  const repeatByMonthOptionArray = [
    {label: 'Jan', value: 1},
    {label: 'Feb', value: 2},
    {label: 'Mar', value: 3},
    {label: 'Apr', value: 4},
    {label: 'Mai', value: 5},
    {label: 'Jun', value: 6},
    {label: 'Jul', value: 7},
    {label: 'Aug', value: 8},
    {label: 'Sep', value: 9},
    {label: 'Oct', value: 10},
    {label: 'Nov', value: 11},
    {label: 'Dez', value: 12}
  ]
  const repeatByDayForYearArray = [
    {label: 'Monday', value: Weekday.Mo},
    {label: 'Tuesday', value: Weekday.Tu},
    {label: 'Wednesday', value: Weekday.We},
    {label: 'Thursday', value: Weekday.Th},
    {label: 'Friday', value: Weekday.Fr},
    {label: 'Saturday', value: Weekday.Sa},
    {label: 'Sunday', value: Weekday.Su},
    {label: 'All days in week', value: [Weekday.Mo, Weekday.Tu, Weekday.We, Weekday.Th, Weekday.Fr, Weekday.Sa, Weekday.Su]},
    {label: 'All weekdays', value: [Weekday.Mo, Weekday.Tu, Weekday.We, Weekday.Th, Weekday.Fr]},
    {label: 'All weekend days', value: [Weekday.Sa, Weekday.Su]}
  ]

  const repeatEndOptionArray : Ref<any[]> = ref([
    {label: 'Never', value: 'never'},
    {label: 'After', value: 'after'},
    {label: 'On Date', value: 'onDate'}
  ]);

  const repeatFreq: Ref<string> = ref('')
  const repeatInterval: Ref<number | undefined> = ref(undefined);       // hourly/daily/weekly/monthly/yearly
  const repeatCount: Ref<number | undefined> = ref(undefined);          // kein repeatUntil wenn repeatCount // hourly/daily/weekly/monthly/yearly
  const repeatUntil: Ref<Date | undefined> = ref(undefined)             // kein repeatCount wenn repeatUntil //hourly/daily/weekly/monthly/yearly
  const repeatByDay: Ref<any> = ref(undefined)                          // weekly/monthly/yearly
  const repeatByMonth: Ref<any> = ref(undefined);                       // monthly/yearly
  const repeatByMonthDay: Ref<any> = ref(undefined)                     // yearly
  const repeatBySetPos: Ref<any> = ref(undefined)                       // monthly/yearly

  const repeatCountLabel: Ref<string | undefined> = ref(undefined)
  const repeatYearOption: Ref<string> = ref('onSpecific')
  const repeatEndOption : Ref<string> = ref('never');

  function setRepeatCountLabel(repeatFreq: string) {
    repeatCountLabel.value = repeatFreqArray.find((f:any) => f.value === repeatFreq)?.unit;
  }


  function resetYearlyInterval() {
    console.log("resetYearlyInterval");
    repeatBySetPos.value = undefined;
    repeatByMonth.value = undefined;
    repeatByDay.value = undefined;
    repeatByMonthDay.value = undefined;
    repeatUntil.value = undefined;
  }
  function resetRepeatEndOptions() {
    repeatUntil.value = undefined;
    repeatCount.value = undefined;
  }
  function resetRepeatFreqOptions() {
    repeatInterval.value = undefined;
    repeatEndOption.value = 'never';
    resetYearlyInterval();
    resetRepeatEndOptions();
  }

  function save(){
    console.log('save')
  }

  function cancel() {
    dialogRef.value.close();
  }

</script>

<template>
  <div class="scheduler relative">
    <div class="grid grid-cols-6 items-center">
      <div class="col-span-1 mb-4">{{$t('start')}}</div>
      <Calendar v-model="start" placeholder="dd/mm/yyyy" autocomplete="off" style="width: 100%" :class="'col-span-5 mb-4'"/>

      <div class="col-span-1">{{$t('end')}}</div>
      <Calendar v-model="end" placeholder="dd/mm/yyyy" autocomplete="off" style="width: 100%" :class="'col-span-5'"/>
      <hr class="col-start-0 col-span-6 mb-4 mt-4">
      <div class="col-span-6 grid grid-cols-6 gap-4  mt-4">
        <div class="col-span-1">{{$t('repeat')}}</div>
        <!-- Frequency: never to yearly -->
        <div class="col-span-5 grid grid-cols-5 gap-4">
          <SelectButton v-model="repeatFreq" :options="repeatFreqArray" option-label="label" option-value="value" class="col-span-5 w-full" @click="setRepeatCountLabel(repeatFreq)" @change="resetRepeatFreqOptions"></SelectButton>
          <div v-if="repeatFreq" class="col-span-5">
            <InputText v-model="repeatInterval" type="text" :placeholder="'Enter repeat interval.'"/>  <span class="ml-2">{{repeatCountLabel}}</span>
          </div>
        </div>

        <hr v-if="repeatFreq === Frequency.Weekly" class="col-start-0 col-span-6 mb-4 mt-4">
        <!-- weekday select -->
        <div v-if="repeatFreq === Frequency.Weekly" class="col-start-2 col-span-5 grid grid-cols-5 gap-4">

          <SelectButton v-model="repeatByDay" :options="repeatWeekdayArray" option-label="label" option-value="value" class="col-span-3 w-full" :multiple="true"></SelectButton>
        </div>

        <!-- monthly/yearly select -->
        <div v-if="repeatFreq === Frequency.Yearly || repeatFreq === Frequency.Monthly" class="col-start-2 col-span-5 grid grid-cols-5 gap-4" >
          <Dropdown v-model="repeatYearOption" :options="repeatYearOptionArray" :option-label="'label'" :option-value="'value'" class="col-span-3" @change="resetYearlyInterval()">
          </Dropdown>

          <div v-if="repeatYearOption === repeatYearOptionArray[0].value" class="col-start-0 col-span-5 grid grid-cols-3 gap-4 items-center">
            <Dropdown v-if="repeatFreq === Frequency.Yearly" v-model="repeatByMonth" :options="repeatByMonthOptionArray" :option-label="'label'" :option-value="'value'"  :placeholder="'Choose Month'"/>
            <InputText v-model="repeatByMonthDay" :placeholder="'Enter Day of Month'" />
          </div>
          <div v-if="repeatYearOption === repeatYearOptionArray[1].value" class="col-start-0 col-span-5 grid grid-cols-3 gap-4">
            <Dropdown v-model="repeatBySetPos" :options="repeatBySetPosOptionArray" :option-label="'label'" :option-value="'value'"  :placeholder="'Choose General Interval'"/>
            <Dropdown v-model="repeatByDay" :options="repeatByDayForYearArray" :option-label="'label'" :option-value="'value'"  :placeholder="'Choose Day Interval'"/>
            <Dropdown v-if="repeatFreq === Frequency.Yearly" v-model="repeatByMonth" :options="repeatByMonthOptionArray" :option-label="'label'" :option-value="'value'"  :placeholder="'Choose Month'"/>
          </div>
        </div>
        <hr class="col-start-0 col-span-6 mb-4 mt-4">
        <div class="col-start-2 col-span-5 grid grid-cols-3 gap-4">
          <Dropdown v-model="repeatEndOption" :options="repeatEndOptionArray" :option-label="'label'" :option-value="'value'" class="col-span-1" @change="resetRepeatEndOptions"/>
          <div v-if="repeatEndOption === 'after'" class="col-span-2">
            <InputText v-model="repeatCount" type="text" :placeholder="'Enter repeat count'" /> <span class="ml-2">{{repeatCountLabel}}</span>
          </div>
          <div v-else-if="repeatEndOption === 'onDate'" class="col-span-2" >
            <Calendar v-model="repeatUntil" placeholder="dd/mm/yyyy" autocomplete="off" style="width: 100%" :class="'col-span-5'"/>
          </div>
        </div>
      </div>
    </div>


    <div class="grid grid-cols-6 pos-bottom">
      <div class=" col-start-0 col-span-6 buttons text-right mt-8 justify-end">
        <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
        <Button @click="save()">Save</Button>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
  .scheduler {
    min-height: 600px;

    .pos-bottom {
      position: absolute;
      bottom: 20px;
      right: 20px;
    }
  }

</style>
