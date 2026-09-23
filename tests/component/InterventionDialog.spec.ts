/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, Ref } from 'vue';
import InterventionDialog from '../../src/components/dialog/InterventionDialog.vue';
import SchedulerInfoBlock from '../../src/components/subComponents/SchedulerInfoBlock.vue';

const milestones = ref<any[]>([]);

// hoisted: `createI18n` is invoked while src/i18n/i18n.ts is evaluated, which
// happens before this module's own top-level bindings are initialised
const { t, d, validateProperties } = vi.hoisted(() => ({
  t: (key: string): string => key,
  d: (value: unknown): string => String(value),
  validateProperties: vi.fn(),
}));

vi.mock('vue-i18n', () => ({
  useI18n: (): Record<string, unknown> => ({ t, d }),
  createI18n: (): Record<string, unknown> => ({ global: { t, d } }),
}));

vi.mock('../../src/composable/useApi', () => ({
  useComponentsApi: (): Record<string, unknown> => ({
    componentsApi: { validateProperties },
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
  {
    // stands in for any trigger that is not the relative-time one; a plain
    // STRING property keeps the fixture free of the cron preset that only gets
    // registered as a side effect of loading CronSchedulerConfiguration.vue
    componentId: 'scheduled-datacheck-trigger',
    title: 'intervention.factory.trigger.scheduledDatacheck.title',
    description: 'intervention.factory.trigger.scheduledDatacheck.description',
    properties: [{ id: 'query', type: 'STRING', defaultValue: 'x' }],
  },
];

const actionFactories = [
  {
    componentId: 'push-notification-action',
    title: 'intervention.factory.action.pushNotification.title',
    label: 'Push Notification',
    defaultProperties: {},
  },
];

function mountDialog(data: Record<string, unknown> = {}): {
  wrapper: any;
  dialogRef: Ref<any>;
} {
  const dialogRef = ref<any>({
    data: {
      actionFactories,
      triggerFactories,
      groupStates: [],
      ...data,
    },
    close: vi.fn(),
  });

  const wrapper = mount(InterventionDialog, {
    shallow: true,
    global: {
      provide: { dialogRef },
      mocks: { $t: t, $d: d },
    },
  });

  return { wrapper, dialogRef };
}

describe('InterventionDialog', () => {
  beforeEach(() => {
    milestones.value = [];
    validateProperties.mockReset();
    validateProperties.mockResolvedValue({ data: { valid: true } });
  });

  it('renders the trigger type dropdown when the study has no milestones', () => {
    const { wrapper } = mountDialog();

    expect(wrapper.find('.dropdown-btn').exists()).toBe(true);
  });

  it('renders the scheduler for a relative-time trigger when the study has no milestones', () => {
    const { wrapper } = mountDialog({
      intervention: { interventionId: 1, title: 'Intervention' },
      triggerData: { type: 'relative-time-trigger', properties: {} },
      actionsData: [],
    });

    expect(wrapper.findComponent(SchedulerInfoBlock).exists()).toBe(true);
  });

  it('still renders the milestone dropdown when the study has milestones', () => {
    milestones.value = [{ milestoneId: 1, name: 'Surgery', orderIndex: 0 }];

    const { wrapper } = mountDialog();

    expect(wrapper.find('.dropdown-btn').exists()).toBe(true);
    // trigger dropdown + milestone dropdown
    expect(wrapper.findAllComponents({ name: 'Dropdown' }).length).toBe(3);
  });

  it('omits the schedule entirely when the trigger has no scheduler', async () => {
    const { wrapper, dialogRef } = mountDialog({
      intervention: { title: 'ghettder' },
      triggerData: {
        type: 'scheduled-datacheck-trigger',
        properties: { query: 'x' },
      },
      actionsData: [
        { actionId: 1, type: 'push-notification-action', properties: {} },
      ],
    });

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(dialogRef.value.close).toHaveBeenCalledTimes(1);
    // an empty object has no `type` discriminator, so the backend rejects the
    // whole intervention with HttpMessageNotReadableException
    expect(
      dialogRef.value.close.mock.calls[0][0].intervention.schedule,
    ).toBeUndefined();
  });

  it('stamps the discriminator on the fallback schedule when the study has no planned dates', async () => {
    const { wrapper, dialogRef } = mountDialog({
      intervention: { title: 'ghettder' },
      triggerData: { type: 'relative-time-trigger', properties: {} },
      actionsData: [
        { actionId: 1, type: 'push-notification-action', properties: {} },
      ],
    });

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(dialogRef.value.close).toHaveBeenCalledTimes(1);
    const { schedule } = dialogRef.value.close.mock.calls[0][0].intervention;
    expect(schedule.type).toBe('Event');
    expect(schedule.dtstart).toBeDefined();
    expect(schedule.dtend).toBeDefined();
  });

  it('sends the configured schedule for a relative-time trigger', async () => {
    const schedule = {
      type: 'Event',
      dtstart: '2026-01-01T00:00:00.000Z',
      dtend: '2026-01-31T23:59:59.000Z',
    };
    const { wrapper, dialogRef } = mountDialog({
      intervention: { title: 'ghettder', schedule },
      triggerData: { type: 'relative-time-trigger', properties: {} },
      actionsData: [
        { actionId: 1, type: 'push-notification-action', properties: {} },
      ],
    });

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(dialogRef.value.close).toHaveBeenCalledTimes(1);
    expect(
      dialogRef.value.close.mock.calls[0][0].intervention.schedule,
    ).toEqual(schedule);
  });
});
