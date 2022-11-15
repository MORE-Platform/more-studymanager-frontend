<script setup lang="ts">
import {ref, Ref, reactive} from 'vue';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

  const props = defineProps({
    studyProp: {type: String, default: undefined},
    propField: {type: String, required: true},
    title: {type: String, required: true},
    styleModifier: {type: String, default: ''}
  })

  const editMode: Ref<Boolean> = ref(false);
  const updatedStudyProp: Ref<String | undefined> = ref(props.studyProp);
  const test = ref();

  const purpose = ref();

    const emit = defineEmits<{
      (e: 'onSaveProp', value: String) : void
    }>()

  function onSaveProp() {
    console.log('emit onSaveProp: ' + updatedStudyProp.value)
    if(updatedStudyProp.value) {
      emit('onSaveProp', updatedStudyProp.value)
    } else {
      console.log('Property ' + props.title + ' is empty');
      updatedStudyProp.value = props.studyProp;
    }

    editMode.value = false;
  }

</script>

<template>
  <div class="edit-study-prop" :class="styleModifier">
    <section>
      <div class="flex mb-1" v-if="studyProp">
        <h5 class="mr-1">{{ title }}</h5>
        <div><Button type="button" class="edit-btn" icon="pi pi-pencil" @click="function(){editMode = !editMode}"></Button></div>
      </div>
      <div v-else><Button type="button">{{$t('add')}} {{title}}</Button></div>
      <div v-if="editMode">
        <Textarea v-model="updatedStudyProp" :placeholder="'Enter information about the ' + title" :auto-resize="true" style="width: 100%"></Textarea>
        <div class="buttons text-right mt-8">
          <Button @click="function(){editMode = false}">Cancel</Button>
          <Button @click="onSaveProp()">Save</Button>
        </div>
      </div>
      <div v-else>{{updatedStudyProp}}</div>
    </section>
  </div>
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

