import axios, { AxiosError } from 'axios';
import useLoader from './useLoader';

export function useErrorHandling() {
  const loader = useLoader();
  const handleIndividualError = (
    error: AxiosError & { globallyHandled?: boolean },
    messageKey?: string
  ) => {
    if (!error.globallyHandled) {
      console.error(`CALL ERROR HANDLING: ${error.config.url} - ${messageKey}`);
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
          error.config.url?.includes('users/me')
        ) {
          console.error(
            'GLOBAL ERROR HANDLING: Request was rejected',
            (error as AxiosError).config.url
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
