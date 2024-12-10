import { Duration, DurationUnitEnum } from '../generated-sources/openapi';
import { minutesInDay, minutesInHour } from '../constants';

export function valueToMinutes(duration: Duration): number {
  const value = duration.value || 0;
  switch (duration.unit) {
    case DurationUnitEnum.Day:
      return value * minutesInDay;
    case DurationUnitEnum.Hour:
      return value * minutesInHour;
    case DurationUnitEnum.Minute:
      return value;
    default:
      return 0;
  }
}

export function minutesToDuration(
  minutes: number,
  originalUnit?: DurationUnitEnum,
): Duration {
  let value = 0;
  let unit = originalUnit;

  switch (unit) {
    case DurationUnitEnum.Day:
      value = minutes / minutesInDay;
      if (value >= 1) {
        break;
      }
      unit = DurationUnitEnum.Hour;
    // eslint-disable-next-line no-fallthrough
    case DurationUnitEnum.Hour:
      value = minutes / minutesInHour;
      if (value >= 1) {
        break;
      }
      unit = DurationUnitEnum.Minute;
    // eslint-disable-next-line no-fallthrough
    default:
      unit = DurationUnitEnum.Minute;
      value = minutes;
      break;
  }

  return {
    value: Math.floor(value),
    unit: unit,
  };
}
