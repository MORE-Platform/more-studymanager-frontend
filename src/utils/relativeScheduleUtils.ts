import { Duration } from '../generated-sources/openapi';
import { DateTime } from 'luxon';
import { roundAndCeil } from './dataUtils';
import { minutesToDuration, valueToMinutes } from './durationUtils';
import { ErrorValue } from '../composable/useErrorHandling';
import i18n from '../i18n/i18n';
import { minutesInDay } from '../constants';

/**
 * Validates the given event offsets and timestamps against a maximum duration constraint.
 *
 * @param {Duration} startOffset - The offset duration for the start of the event.
 * @param {Duration} endOffset - The offset duration for the end of the event.
 * @param {DateTime} [start] - Optional start timestamp of the event.
 * @param {DateTime} [end] - Optional end timestamp of the event.
 * @param {Duration} [maxDuration] - The maximum allowable duration for the event.
 * @returns {ErrorValue | undefined} - An error object if validation fails; otherwise, undefined.
 */
export const correctEvent = (
  startOffset: Duration,
  endOffset: Duration,
  start?: DateTime,
  end?: DateTime,
  maxDuration?: Duration,
): ErrorValue | undefined => {
  const maxValue = maxDuration?.value;
  const { t } = i18n.global;

  if (maxValue) {
    const correctedEndOffset = endOffset.value || 0;
    const correctedStartOffset = startOffset.value || 0;
    if (correctedEndOffset > maxValue || correctedStartOffset > maxValue) {
      return {
        label: 'offsetCorrection',
        value: t('scheduler.dialog.relativeSchedule.error.scheduleTooLong', {
          maxDuration: maxValue,
        }),
      };
    }

    if (
      correctedEndOffset < correctedStartOffset ||
      (correctedStartOffset === correctedEndOffset &&
        start?.isValid &&
        end?.isValid &&
        end <= start)
    ) {
      return {
        label: 'offsetCorrection',
        value: t(
          'scheduler.dialog.relativeSchedule.error.dtend.EndBeforeStart',
        ),
      };
    }
  }
};

/**
 * Adjusts and validates event repetition parameters based on given durations,
 * ensuring they stay within the maximum allowed duration and other constraints.
 *
 * @param {Duration} offsetStart - The starting offset duration of the event.
 * @param {DateTime} startTime - The start timestamp of the event.
 * @param {Duration} offsetEnd - The ending offset duration of the event.
 * @param {DateTime} endTime - The end timestamp of the event.
 * @param {Duration} frequency - The frequency of repetitions for the event.
 * @param {Duration} frequencyEnd - The maximum duration till event repetitions can occur.
 * @param {Duration} maxDuration - The maximum allowed duration for the entire event series.
 * @param {boolean} [correctInPlace=false] - Whether to modify the provided frequency and frequencyEnd in place.
 * @returns {{
 *   frequencyError: ErrorValue | undefined,
 *   frequencyEndError: ErrorValue | undefined,
 *   repetitionEnabled: boolean,
 *   numberOfRepetitions: number
 * }} - An object containing error details (if any), and computed repetition settings.
 */
export const correctEventRepetition = (
  offsetStart: Duration,
  startTime: DateTime,
  offsetEnd: Duration,
  endTime: DateTime,
  frequency: Duration,
  frequencyEnd: Duration,
  maxDuration: Duration,
  correctInPlace: boolean = false,
): {
  frequencyError: ErrorValue | undefined;
  frequencyEndError: ErrorValue | undefined;
  repetitionEnabled: boolean;
  numberOfRepetitions: number;
} => {
  const { t } = i18n.global;

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

  let correctedFrequencyEnd = frequencyEnd;
  let frequencyEndError: ErrorValue | undefined;

  const timeRemaining =
    maxDurationInMinutes - (valueToMinutes(offsetStart) - minutesInDay);
  if (frequencyEndInMinutes > timeRemaining) {
    correctedFrequencyEnd = minutesToDuration(timeRemaining, frequencyEnd.unit);
    frequencyEndInMinutes = timeRemaining;
    frequencyEndError = {
      label: 'frequencyEndError',
      value: t(
        'scheduler.dialog.relativeSchedule.error.rrrule.repetitionEndTooLong',
        {
          durValue: correctedFrequencyEnd.value,
          durUnit: t(
            `scheduler.frequency.${correctedFrequencyEnd.unit?.toString().toLowerCase()}s`,
          ),
        },
      ),
    };
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
  let frequencyError: ErrorValue | undefined;
  if (
    correctedFrequency.value !== frequency.value ||
    correctedFrequency.unit !== frequency.unit
  ) {
    frequencyError = {
      label: 'frequencyError',
      value: t(
        'scheduler.dialog.relativeSchedule.error.rrrule.repetitionTooLong',
        {
          repValue: correctedFrequency.value,
          repUnit: t(
            `scheduler.frequency.${correctedFrequency.unit?.toString().toLowerCase()}s`,
          ),
        },
      ),
    };
  }

  if (correctInPlace) {
    frequency.value = correctedFrequency.value;
    frequency.unit = correctedFrequency.unit;

    frequencyEnd.value = correctedFrequencyEnd.value;
    frequencyEnd.unit = correctedFrequencyEnd.unit;
  }

  const repetitionEnabled = maxFrequencyInMinutes > 0;

  const numberOfRepetitions = Math.ceil(
    Math.min(maxFrequencyInMinutes, frequencyEndInMinutes) /
      correctedFrequencyInMinutes,
  );

  return {
    frequencyError,
    frequencyEndError,
    repetitionEnabled,
    numberOfRepetitions,
  };
};
