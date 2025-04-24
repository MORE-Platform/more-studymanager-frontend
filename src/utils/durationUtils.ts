import { Duration, UnitEnum } from '../generated-sources';
import { ONE_DAY_IN_MINUTES, ONE_HOUR_IN_MINUTES } from '../constants';

export function valueToMinutes(duration: Duration): number {
  const value = duration.value || 0;
  switch (duration.unit) {
    case UnitEnum.Day:
      return value * ONE_DAY_IN_MINUTES;
    case UnitEnum.Hour:
      return value * ONE_HOUR_IN_MINUTES;
    case UnitEnum.Minute:
      return value;
    default:
      return 0;
  }
}

export function minutesToDuration(
  minutes: number,
  originalUnit?: UnitEnum,
): Duration {
  let value = 0;
  let unit = originalUnit;

  switch (unit) {
    case UnitEnum.Day:
      value = minutes / ONE_DAY_IN_MINUTES;
      if (value >= 1) {
        break;
      }
      unit = UnitEnum.Hour;
    // eslint-disable-next-line no-fallthrough
    case UnitEnum.Hour:
      value = minutes / ONE_HOUR_IN_MINUTES;
      if (value >= 1) {
        break;
      }
      unit = UnitEnum.Minute;
    // eslint-disable-next-line no-fallthrough
    default:
      unit = UnitEnum.Minute;
      value = minutes;
      break;
  }

  return {
    value: Math.floor(value),
    unit: unit,
  };
}
