/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { ToastMessageOptions } from 'primevue/toast';
import { useI18n } from 'vue-i18n';
import {
  ValidationReport,
  ValidationReportItem,
} from '../generated-sources/openapi';
import { useToast } from 'primevue/usetoast';

/**
 * This composable is responsible for showing errors from Backend to the Client with a Toast popup.
 */
export function useToastService(): any {
  const toast = useToast();
  const { t } = useI18n();

  if (!toast) {
    throw new Error('ToastService is not provided');
  }

  const handleToastErrors = (err: any): void => {
    processConfigurationException(err);
    processOtherExceptions(err);
  };

  function processConfigurationException(report: ValidationReport): void {
    const errors: string[] = [];
    const warnings: string[] = [];

    report.errors?.forEach((error: ValidationReportItem) => {
      let errorMessage = '';

      if (error.message) {
        if (error.componentTitle) {
          errorMessage = t('global.error.inComponentTitle', {
            title: error.componentTitle,
          });
        }
        errorMessage += t(error.message, { value: error.propertyId });
        errors.push(errorMessage);
      }
    });

    report.warnings?.forEach((warning: ValidationReportItem) => {
      let warningMessage = '';

      if (warning.message) {
        if (warning.componentTitle) {
          warningMessage = t('global.error.inComponentTitle', {
            title: warning.componentTitle,
          });
        }
        warningMessage += t(warning.message, { value: warning.propertyId });
        warnings.push(warningMessage);
      }
    });

    if (errors.length) {
      showErrorToast(errors.join('\n'));
    }

    if (warnings.length) {
      showWarningToast(warnings.join('\n'));
    }
  }

  function processOtherExceptions(error: any): void {
    if (error.message) {
      showErrorToast(error.message);
    }
  }

  const showToast = (
    severity: ToastMessageOptions['severity'],
    summary: string,
    detail: string,
  ): void => {
    if (toast) {
      toast.add({ severity, summary, detail });
    } else {
      console.error('Toast reference is not set');
    }
  };

  const showErrorToast = (detail: string): void => {
    if (toast) {
      const severity: ToastMessageOptions['severity'] = 'error';
      const summary = t('global.error.type.error');
      const life: ToastMessageOptions['life'] = 5000;

      toast.add({ severity, summary, detail, life });
    } else {
      console.error('Toast reference is not set');
    }
  };

  const showWarningToast = (detail: string): void => {
    if (toast) {
      const severity: ToastMessageOptions['severity'] = 'warn';
      const summary = t('global.error.type.warning');
      const life: ToastMessageOptions['life'] = 5000;

      toast.add({ severity, summary, detail, life });
    } else {
      console.error('Toast reference is not set');
    }
  };

  return {
    handleToastErrors,
    showToast,
    showErrorToast,
    showWarningToast,
  };
}
