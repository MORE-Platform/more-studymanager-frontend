/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { mount } from '@vue/test-utils';
import { expect, describe, it } from 'vitest';
import StudyStatusPill from '../../src/components/study/StudyStatusPill.vue';
import { StudyStatus } from '../../src/generated-sources';

describe('StudyStatusPill', () => {
  it('renders the class property correctly for different statuses', () => {
    const statuses = [
      StudyStatus.Draft,
      StudyStatus.Preview,
      StudyStatus.PausedPreview,
      StudyStatus.Active,
      StudyStatus.Paused,
      StudyStatus.Closed,
    ];

    statuses.forEach((status) => {
      const wrapper = mount(StudyStatusPill, {
        props: {
          status: status as StudyStatus,
        },
        global: {
          mocks: {
            $t: (msg: string) => msg,
          },
        },
      });

      expect(wrapper.classes()).toEqual(expect.arrayContaining([status]));
      expect(wrapper.text()).toContain(`study.statusStrings.${status}`);
    });
  });
});
