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

export function useErrorHandling() {
  const loader = useLoader();
  const handleIndividualError = (
    error: AxiosError & { globallyHandled?: boolean },
    messageKey?: string
  ) => {
    if (!error.globallyHandled) {
      console.error(
        error.config?.url
          ? `CALL ERROR HANDLING: ${error.config.url} - ${messageKey}`
          : `ERROR CONFIG IS UNDEFINED - ${messageKey}`
      );
      loader.reset();
    }
  };
  const activateGlobalErrorHandlingInterceptor = () => {
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
            (error as AxiosError).config?.url
          );
          globallyHandled = true;
          loader.reset();
        }
        return Promise.reject({ ...error, globallyHandled });
      }
    );
  };
  return {
    handleIndividualError,
    activateGlobalErrorHandlingInterceptor,
  };
}
