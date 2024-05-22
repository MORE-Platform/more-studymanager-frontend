/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { readonly, ref } from 'vue';
import axios from 'axios';

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
  activateLoadingInterceptor: () => {
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
export default () => {
  return loader;
};
