export const hasData = (data?: string | number): boolean => {
  return !(
    data === undefined ||
    data === null ||
    (typeof data === 'string' && data.trim() === '')
  );
};
