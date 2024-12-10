export const hasData = (data?: string | number): boolean =>
  !(
    data === undefined ||
    data === null ||
    (typeof data === 'string' && data.trim() === '') ||
    (typeof data === 'number' && isNaN(data))
  );

export const roundAndCeil = (input: number): number =>
  Math.ceil(Math.abs(input));
