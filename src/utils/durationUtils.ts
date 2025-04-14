import { Duration, UnitEnum } from '../generated-sources/openapi';
import { minutesInDay, minutesInHour } from '../constants';

export function valueToMinutes(duration: Duration): number {
  const value = duration.value || 0;
  switch (duration.unit) {
    case UnitEnum.Day:
      return value * minutesInDay;
    case UnitEnum.Hour:
      return value * minutesInHour;
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
      value = minutes / minutesInDay;
      if (value >= 1) {
        break;
      }
      unit = UnitEnum.Hour;
    // eslint-disable-next-line no-fallthrough
    case UnitEnum.Hour:
      value = minutes / minutesInHour;
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
