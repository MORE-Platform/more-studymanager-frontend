import { readonly, ref } from 'vue';

const loaderSemaphore = ref(0);
const loaderValue = ref(false);

const loader = {
  enable: () => {
    loaderSemaphore.value += 1;
    loaderValue.value = loaderSemaphore.value > 0;
  },
  disable: () => {
    loaderSemaphore.value =
      loaderSemaphore.value < 2 ? 0 : loaderSemaphore.value - 1;
    loaderValue.value = loaderSemaphore.value > 0;
  },
  reset: () => {
    loaderSemaphore.value = 0;
    loaderValue.value = false;
  },
  isLoading: readonly(loaderValue),
};
export default () => {
  return loader;
};
