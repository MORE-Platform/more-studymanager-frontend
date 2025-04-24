import { Duration, DurationUnitEnum } from '../generated-sources/openapi';
import { ONE_DAY_IN_MINUTES, ONE_HOUR_IN_MINUTES } from '../constants';

export function valueToMinutes(duration: Duration): number {
  const value = duration.value || 0;
  switch (duration.unit) {
    case DurationUnitEnum.Day:
      return value * ONE_DAY_IN_MINUTES;
    case DurationUnitEnum.Hour:
      return value * ONE_HOUR_IN_MINUTES;
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
      value = minutes / ONE_DAY_IN_MINUTES;
      if (value >= 1) {
        break;
      }
      unit = DurationUnitEnum.Hour;
    // eslint-disable-next-line no-fallthrough
    case DurationUnitEnum.Hour:
      value = minutes / ONE_HOUR_IN_MINUTES;
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
