export function dateToDateString(date: Date) {
  if(date) {
    const offset = new Date(date).getTimezoneOffset()/60;
    date.setHours(date.getHours()-offset);
    return date.toISOString().substring(0, 10);
  } else {
    return undefined;
  }
}

export function dateToDateTimeString(date: Date) {
  if(date) {
    const offset = new Date(date).getTimezoneOffset()/60;
    date.setHours(date.getHours()-offset);
    return date.toISOString().substring(0, 19) + 'Z';
  } else {
    return undefined;
  }
}
