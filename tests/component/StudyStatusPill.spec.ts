import { mount } from '@vue/test-utils';
import { expect, describe, it } from 'vitest';
import StudyStatusPill from '../../src/components/study/StudyStatusPill.vue';
import { StudyStatus } from '../../src/generated-sources/openapi';

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
