import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { Study, StudyGroup } from '../generated-sources/openapi';

export const useStudyStore = defineStore('study', () => {
  const studyGroups: Ref<StudyGroup[]> = ref([]);
  const study: Ref<Study> = ref({});

  return { study, studyGroups };
});
