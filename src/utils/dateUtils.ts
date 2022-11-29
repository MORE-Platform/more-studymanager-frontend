export function dateToDateString(date: Date) {
  return dateToDateTimeString(date)?.substring(0, 10);
}

export function dateToDateTimeString(date: Date): string | undefined {
  if(date) {
    const offset = new Date(date).getTimezoneOffset()/60;
    date.setHours(date.getHours()-offset);
    return date.toISOString();
  } else {
    return undefined;
  }
}

export function dateTimeStringToDate(dateTimeString: string): Date | undefined {
   if(dateTimeString) {
     const date = new Date(dateTimeString)
     const offset = date.getTimezoneOffset()/60;
     date.setHours(date.getHours()+offset);
     return date;
   } else {
     return undefined
   }
}
