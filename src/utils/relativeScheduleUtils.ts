import { Duration, DurationUnitEnum } from '../generated-sources/openapi';
import { DateTime, DurationLike } from 'luxon';
import { roundAndCeil } from './dataUtils';
import { minutesToDuration, valueToMinutes } from './durationUtils';

export const correctEvent = (
  startOffset: Duration,
  endOffset: Duration,
  start?: DateTime,
  end?: DateTime,
  maxDuration?: Duration,
): {
  offsetCorrected: boolean;
  correctStart?: DateTime;
  correctEnd?: DateTime;
} => {
  const maxValue = maxDuration?.value;

  let offsetCorrected = false;
  if (maxValue) {
    const { unit } = maxDuration;

    if (unit === DurationUnitEnum.Hour || unit === DurationUnitEnum.Minute) {
      startOffset.value = 1;
      endOffset.value = 1;
      offsetCorrected = true;
    } else {
      const originalEnd = endOffset.value;
      const originalStart = startOffset.value;
      endOffset.value = Math.min(endOffset.value || 0, maxValue);
      startOffset.value = Math.min(startOffset.value || 0, maxValue);
      if (endOffset.value < startOffset.value) {
        endOffset.value = startOffset.value;
      }
      if (startOffset.value > endOffset.value) {
        startOffset.value = endOffset.value;
      }
      offsetCorrected =
        originalEnd !== endOffset.value || originalStart !== startOffset.value;

      if (
        startOffset.value === endOffset.value &&
        start?.isValid &&
        end?.isValid &&
        end <= start
      ) {
        const timeGapOnWrongDiff: DurationLike = { hour: 1 };
        const remainingMinutes = roundAndCeil(
          start.diff(start.set({ hour: 23, minute: 59 })).minutes,
        );

        if (remainingMinutes >= 60) {
          end = start.plus(timeGapOnWrongDiff);
        } else {
          start = end.minus(timeGapOnWrongDiff);
        }
      }
    }
  }

  return {
    offsetCorrected,
    correctStart: start,
    correctEnd: end,
  };
};

export const correctEventRepetition = (
  offsetStart: Duration,
  startTime: DateTime,
  offsetEnd: Duration,
  endTime: DateTime,
  frequency: Duration,
  frequencyEnd: Duration,
  maxDuration: Duration,
): {
  frequencyCorrected: boolean;
  frequencyEndCorrected: boolean;
  repetitionEnabled: boolean;
  numberOfRepetitions: number;
} => {
  const startTimeDiffInMinutes = roundAndCeil(
    startTime.diff(startTime.set({ hour: 23, minute: 59 }), 'minutes').minutes,
  );

  const endTimeDiffInMinutes = roundAndCeil(
    endTime.diff(endTime.set({ hour: 23, minute: 59 }), 'minutes').minutes,
  );

  const offsetStartInMinutes =
    valueToMinutes(offsetStart) - startTimeDiffInMinutes;

  const offsetEndInMinutes = valueToMinutes(offsetEnd) - endTimeDiffInMinutes;

  const offsetDuration = offsetEndInMinutes - offsetStartInMinutes;

  const maxDurationInMinutes = valueToMinutes(maxDuration);

  let frequencyEndInMinutes = valueToMinutes(frequencyEnd);
  let frequencyEndCorrected = false;
  if (frequencyEndInMinutes > maxDurationInMinutes) {
    const correctedFrequencyEnd = minutesToDuration(
      maxDurationInMinutes,
      maxDuration.unit,
    );
    frequencyEnd.value = correctedFrequencyEnd.value;
    frequencyEnd.unit = correctedFrequencyEnd.unit;
    frequencyEndInMinutes = maxDurationInMinutes;
    frequencyEndCorrected = true;
  }

  const remainingMinutes = maxDurationInMinutes - offsetStartInMinutes;

  const maxFrequencyInMinutes = Math.max(remainingMinutes - offsetDuration, 1);

  const frequencyInMinutes = Math.max(valueToMinutes(frequency), 0);

  const correctedFrequencyInMinutes = Math.min(
    frequencyInMinutes,
    maxFrequencyInMinutes,
  );

  const correctedFrequency = minutesToDuration(
    correctedFrequencyInMinutes,
    frequency.unit,
  );

  let frequencyCorrected = false;
  if (
    frequency.value !== correctedFrequency.value ||
    frequency.unit !== correctedFrequency.unit
  ) {
    frequency.value = correctedFrequency.value;
    frequency.unit = correctedFrequency.unit;
    frequencyCorrected = true;
  }

  const repetitionEnabled = maxFrequencyInMinutes > 0;

  const numberOfRepetitions =
    Math.ceil(
      Math.min(maxFrequencyInMinutes, frequencyEndInMinutes) /
        correctedFrequencyInMinutes,
    ) - 1;

  return {
    frequencyCorrected,
    frequencyEndCorrected,
    repetitionEnabled,
    numberOfRepetitions,
  };
};
