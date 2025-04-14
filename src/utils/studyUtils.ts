import { Duration, UnitEnum, Study } from '../generated-sources/openapi';
import { createLuxonDateTime } from './dateUtils';
import { roundAndCeil } from './dataUtils';
import { DateTime } from 'luxon';

export const calcStudyDuration = (
  plannedStart?: DateTime,
  plannedEnd?: DateTime,
  duration?: Duration,
): Duration | undefined => {
  if (duration) {
    return duration;
  }
  const start = plannedStart?.set({
    hour: 0,
    minute: 0,
  });
  const end = plannedEnd?.set({
    hour: 23,
    minute: 59,
  });
  if (start?.isValid && end?.isValid) {
    return {
      value: roundAndCeil(end.diff(start, 'day').days),
      unit: UnitEnum.Day,
    };
  }
};

export const calcStudyDurationFromStudy = (
  study?: Study,
): Duration | undefined =>
  calcStudyDuration(
    createLuxonDateTime(study?.plannedStart),
    createLuxonDateTime(study?.plannedEnd),
    study?.duration,
  );
