export const flatJoin = (...classes: (string | string[])[]): string =>
  classes.flat().join(' ');

export const safeString = (value?: unknown): string =>
  value === undefined || value === null ? '' : String(value).trim();
