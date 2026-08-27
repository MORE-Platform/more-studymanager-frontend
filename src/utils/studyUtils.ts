/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { Study, StudyDurationUnitEnum } from '@gs';
import { Duration } from '@gs/models/duration';
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
      unit: StudyDurationUnitEnum.Day,
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
