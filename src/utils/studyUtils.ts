import {
  Duration,
  DurationUnitEnum,
  Study,
} from '../generated-sources/openapi';
import { createLuxonDateTime } from './dateUtils';
import { roundAndCeil } from './dataUtils';

export const studyDuration = (study?: Study): Duration | undefined => {
  const duration = study?.duration;
  if (duration) {
    return duration;
  }
  const start = createLuxonDateTime(study?.plannedStart)?.set({
    hour: 0,
    minute: 0,
  });
  const end = createLuxonDateTime(study?.plannedEnd)?.set({
    hour: 23,
    minute: 59,
  });
  if (start && end) {
    return {
      value: roundAndCeil(end.diff(start, 'day').days),
      unit: DurationUnitEnum.Day,
    };
  }
};
