/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import InterventionDialog from '../../src/components/dialog/InterventionDialog.vue';
import SchedulerInfoBlock from '../../src/components/subComponents/SchedulerInfoBlock.vue';

const milestones = ref<any[]>([]);

// hoisted: `createI18n` is invoked while src/i18n/i18n.ts is evaluated, which
// happens before this module's own top-level bindings are initialised
const { t, d } = vi.hoisted(() => ({
  t: (key: string): string => key,
  d: (value: unknown): string => String(value),
}));

vi.mock('vue-i18n', () => ({
  useI18n: (): Record<string, unknown> => ({ t, d }),
  createI18n: (): Record<string, unknown> => ({ global: { t, d } }),
}));

vi.mock('../../src/composable/useApi', () => ({
  useComponentsApi: (): Record<string, unknown> => ({
    componentsApi: { validateProperties: vi.fn() },
  }),
}));

vi.mock('primevue/usedialog', () => ({
  useDialog: (): Record<string, unknown> => ({ open: vi.fn() }),
}));

vi.mock('../../src/stores/studyStore', () => ({
  useStudyStore: (): Record<string, unknown> => ({
    studyId: 1,
    study: { status: 'draft' },
  }),
}));

vi.mock('../../src/stores/observationGroupStore', () => ({
  useObservationGroupStore: (): Record<string, unknown> => ({
    observationGroups: [],
  }),
}));

vi.mock('../../src/stores/milestoneStore', () => ({
  useMilestoneStore: (): Record<string, unknown> => ({
    milestones: milestones.value,
  }),
}));

const triggerFactories = [
  {
    componentId: 'relative-time-trigger',
    title: 'intervention.factory.trigger.relativeTime.title',
    description: 'intervention.factory.trigger.relativeTime.description',
    properties: [
      { id: 'day', type: 'INTEGER', defaultValue: 1 },
      { id: 'hour', type: 'INTEGER', defaultValue: 1 },
    ],
  },
];

function mountDialog(data: Record<string, unknown> = {}): any {
  return mount(InterventionDialog, {
    shallow: true,
    global: {
      provide: {
        dialogRef: ref({
          data: {
            actionFactories: [],
            triggerFactories,
            groupStates: [],
            ...data,
          },
        }),
      },
      mocks: {
        $t: t,
        $d: d,
      },
    },
  });
}

describe('InterventionDialog', () => {
  beforeEach(() => {
    milestones.value = [];
  });

  it('renders the trigger type dropdown when the study has no milestones', () => {
    const wrapper = mountDialog();

    expect(wrapper.find('.dropdown-btn').exists()).toBe(true);
  });

  it('renders the scheduler for a relative-time trigger when the study has no milestones', () => {
    const wrapper = mountDialog({
      intervention: { interventionId: 1, title: 'Intervention' },
      triggerData: { type: 'relative-time-trigger', properties: {} },
      actionsData: [],
    });

    expect(wrapper.findComponent(SchedulerInfoBlock).exists()).toBe(true);
  });

  it('still renders the milestone dropdown when the study has milestones', () => {
    milestones.value = [{ milestoneId: 1, name: 'Surgery', orderIndex: 0 }];

    const wrapper = mountDialog();

    expect(wrapper.find('.dropdown-btn').exists()).toBe(true);
    // trigger dropdown + milestone dropdown
    expect(wrapper.findAllComponents({ name: 'Dropdown' }).length).toBe(3);
  });
});
