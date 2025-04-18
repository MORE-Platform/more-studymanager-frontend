/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { computed, Ref, ref } from 'vue';
import { defineStore } from 'pinia';
import { useUsersApi } from '../composable/useApi';
import { CurrentUser } from '../generated-sources';
import { AxiosError } from 'axios';
import { useErrorHandling } from '../composable/useErrorHandling';

export const useUserStore = defineStore('user', () => {
  const { usersApi } = useUsersApi();
  const { handleIndividualError } = useErrorHandling();

  // State
  const user: Ref<CurrentUser | null> = ref(null);

  // Actions
  async function getUser(): Promise<void> {
    if (!user.value) {
      user.value = await usersApi
        .getCurrentUser()
        .then((response) => response.data)
        .catch((e: AxiosError) => {
          handleIndividualError(e, 'cannot read user');
          return user.value;
        });
    }
  }

  // Getters
  const userName = computed(() => user.value?.name || '');
  const userInstitution = computed(() => user.value?.institution || '');

  return { user, userName, userInstitution, getUser };
});
