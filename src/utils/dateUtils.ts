/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
export function dateToDateString(date: Date): string | undefined {
  return dateToDateTimeString(date)?.substring(0, 10);
}

export function dateToDateTimeString(date: Date): string | undefined {
  if (date) {
    const offset = new Date(date).getTimezoneOffset() / 60;
    date.setHours(date.getHours() - offset);
    return date.toISOString();
  } else {
    return undefined;
  }
}

export function dateTimeStringToDate(dateTimeString: string): Date | undefined {
  if (dateTimeString) {
    const date = new Date(dateTimeString);
    const offset = date.getTimezoneOffset() / 60;
    date.setHours(date.getHours() + offset);
    return date;
  } else {
    return undefined;
  }
}

export function ZTimeToOffsetTime(date: Date): Date {
  const offset = date.getTimezoneOffset() / 60;
  const newTime = new Date(date.getTime());
  newTime.setHours(date.getHours() - offset);
  return newTime;
}

export function ZTimeStringToOffsetTimeString(
  time: string | undefined,
): string | undefined {
  let newTime = time ? new Date() : undefined;
  if (newTime && time) {
    newTime.setHours(
      parseInt(time.substring(0, 2)),
      parseInt(time?.substring(3, 5), 0),
    );
    newTime = ZTimeToOffsetTime(newTime);
    return newTime.toString().substring(16, 21);
  }
  return undefined;
}

/**
 * Converts a time string in the format HH:mm:ss into a character string in the format HH:mm.
 * @param time - A time string in the format HH:mm:ss (e.g. "10:30:00") or `undefined`.
 * @returns A character string in the format HH:mm (e.g. "10:30") or `undefined` if the input is `undefined`.
 */
export function timeToHourMinuteString(
  time: string | undefined,
): string | undefined {
  if (time) {
    return time.substring(0, 5);
  }

  return time;
}
