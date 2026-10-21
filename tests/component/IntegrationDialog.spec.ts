/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { expect, describe, it, vi } from 'vitest';
import IntegrationDialog from '../../src/components/dialog/IntegrationDialog.vue';

vi.mock('vue-i18n', () => ({
  useI18n: (): { t: (key: string) => string } => ({ t: (key: string) => key }),
}));

vi.mock('../../src/stores/studyStore', () => ({
  useStudyStore: (): { study: { status: string } } => ({
    study: { status: 'DRAFT' },
  }),
}));

describe('IntegrationDialog', () => {
  it('marks the integration title label as required', () => {
    const wrapper = mount(IntegrationDialog, {
      global: {
        mocks: {
          $t: (key: string): string => key,
        },
        provide: {
          dialogRef: ref({ data: { observationList: [], factories: [] } }),
        },
        stubs: {
          InputText: true,
          Dropdown: true,
          Button: true,
        },
      },
    });

    const titleLabel = wrapper
      .findAll('h5')
      .find((h) =>
        h.text().includes('integration.dialog.label.integrationTitle'),
      );

    expect(titleLabel?.text()).toMatch(/\*$/);
  });
});
