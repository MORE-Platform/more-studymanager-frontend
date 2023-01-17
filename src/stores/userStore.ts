import { computed, Ref, ref } from 'vue';
import { defineStore } from 'pinia';
import { useUsersApi } from '../composable/useApi';
import { CurrentUser } from '../generated-sources/openapi';

export const useUserStore = defineStore('user', () => {
  const { usersApi } = useUsersApi();

  // State
  const user: Ref<CurrentUser | null> = ref(null);

  // Actions
  async function getUser(): Promise<void> {
    if (!user.value) {
      try {
        user.value = await usersApi
          .getCurrentUser()
          .then((response) => response.data);
      } catch (e) {
        console.error('cannot read user', e);
      }
    }
  }

  // Getters
  const userName = computed(() => user.value?.name || '');
  const userInstitution = computed(() => user.value?.institution || '');

  return { user, userName, userInstitution, getUser };
});
