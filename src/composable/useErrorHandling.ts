/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import axios, { AxiosError } from 'axios';
import useLoader from './useLoader';
import { computed, ComputedRef, Ref, ref } from 'vue';

type UseErrorHandlingReturnType = {
  handleIndividualError: (
    error: AxiosError & { globallyHandled?: boolean },
    messageKey?: string,
  ) => void;
  activateGlobalErrorHandlingInterceptor: () => void;
};

export function useErrorHandling(): UseErrorHandlingReturnType {
  const loader = useLoader();
  const handleIndividualError = (
    error: AxiosError & { globallyHandled?: boolean },
    messageKey?: string,
  ): void => {
    if (!error.globallyHandled) {
      console.error(
        error.config?.url
          ? `CALL ERROR HANDLING: ${error.config.url} - ${messageKey}`
          : `ERROR CONFIG IS UNDEFINED - ${messageKey}`,
      );
      loader.reset();
    }
  };
  const activateGlobalErrorHandlingInterceptor = (): void => {
    axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        let globallyHandled = false;
        // Main building blocks that break the whole application can be handled here
        // like 401 Unauthorized, no User found
        if (
          error.response?.status === 401 ||
          error.config?.url?.includes('users/me')
        ) {
          console.error(
            'GLOBAL ERROR HANDLING: Request was rejected',
            (error as AxiosError).config?.url,
          );
          globallyHandled = true;
          loader.reset();
        }
        return Promise.reject({ ...error, globallyHandled });
      },
    );
  };
  return {
    handleIndividualError,
    activateGlobalErrorHandlingInterceptor,
  };
}

export type ErrorValue = {
  label: string;
  value: string;
};

const errors = ref<ErrorValue[]>([]);

export const useErrorQueue = (): {
  errors: Ref<ErrorValue[]>;
  addError: (error: ErrorValue) => void;
  clearError: (label: string | string[]) => void;
  clearAllErrors: () => void;
  getError: ComputedRef<
    (label: string | string[]) => string | null | undefined
  >;
} => {
  const addError = (error: ErrorValue): void => {
    errors.value.push(error);
  };

  const clearError = (label: string | string[]): void => {
    if (Array.isArray(label)) {
      errors.value = errors.value.filter((el) => !label.includes(el.label));
    } else {
      errors.value = errors.value.filter((el) => el.label !== label);
    }
  };

  const clearAllErrors = (): void => {
    errors.value = [];
  };

  // TODO If used across different components, it is only valid on the first run, after which reactivity is broken
  const getError = computed(
    () =>
      (label: string | string[]): string | null | undefined => {
        if (Array.isArray(label)) {
          for (const lbl of label) {
            const error = errors.value.find((el) => el.label === lbl)?.value;
            if (!error) {
              return error;
            }
          }
          return undefined;
        } else {
          return errors.value.find((el) => el.label === label)?.value;
        }
      },
  );

  return {
    errors,
    addError,
    clearError,
    clearAllErrors,
    getError,
  };
};
