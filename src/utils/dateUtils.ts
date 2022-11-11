export function dateToDateString(date: Date) {
  if(date) {
    const offset = new Date(date).getTimezoneOffset()/60;
    date.setHours(date.getHours()-offset);
    return date.toISOString().substring(0, 10);
  } else {
    return undefined;
  }
}
