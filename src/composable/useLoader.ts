/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { readonly, Ref, ref } from 'vue';
import axios from 'axios';

const loaderSemaphore: Ref<number> = ref(0);
const loaderValue: Ref<boolean> = ref(false);

interface Loader {
  enable: () => void;
  disable: () => void;
  reset: () => void;
  isLoading: Readonly<Ref<boolean>>;
  activateLoadingInterceptor: () => void;
}

const loader: Loader = {
  enable: (): void => {
    loaderSemaphore.value += 1;
    loaderValue.value = loaderSemaphore.value > 0;
  },
  disable: (): void => {
    loaderSemaphore.value =
      loaderSemaphore.value < 2 ? 0 : loaderSemaphore.value - 1;
    loaderValue.value = loaderSemaphore.value > 0;
  },
  reset: (): void => {
    loaderSemaphore.value = 0;
    loaderValue.value = false;
  },
  isLoading: readonly(loaderValue),
  activateLoadingInterceptor: (): void => {
    axios.interceptors.request.use(
      (config) => {
        return {
          ...config,
          startTimestampRequest: performance.now(),
        };
      },
      (error) => Promise.reject(error),
    );

    // loader will be shown
    axios.interceptors.response.use(
      async (response: any) => {
        const minimumDelay = 300;
        const latency =
          performance.now() - response.config.startTimestampRequest;
        const shouldNotDelay = minimumDelay < latency;

        if (shouldNotDelay) {
          return response;
        }

        const remainder = minimumDelay - latency;
        const [responseWithDelay] = await Promise.all([
          response,
          new Promise((resolve) => setTimeout(resolve, remainder)),
        ]);

        return responseWithDelay;
      },
      (error) => Promise.reject(error),
    );

    axios.interceptors.request.use(
      (config) => {
        loader.enable();
        return config;
      },
      (error) => {
        loader.disable();

        return Promise.reject(error);
      },
    );
    axios.interceptors.response.use(
      (response) => {
        loader.disable();
        return response;
      },
      (error) => {
        loader.disable();
        return Promise.reject(error);
      },
    );
  },
};
export default (): Loader => {
  return loader;
};
