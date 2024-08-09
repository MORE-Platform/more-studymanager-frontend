/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { describe, it, expect } from 'vitest';
import {
  dateTimeStringToDate,
  dateToDateString,
  dateToDateTimeString,
  ZTimeStringToOffsetTimeString,
  ZTimeToOffsetTime,
  timeToHourMinuteString,
} from '../../src/utils/dateUtils';

describe('dateToDateString', () => {
  it('should convert a date to a string in the format YYYY-MM-DD (ISO 8601)', () => {
    const date = new Date('2024-06-27T10:20:30Z');
    const result = dateToDateString(date);
    expect(result).toBe('2024-06-27');
  });
  it('should return undefined if the input is undefined', () => {
    const result = dateToDateString(undefined);
    expect(result).toBeUndefined();
  });
});

describe('dateToDateTimeString', () => {
  it('should convert a date to an ISO string', () => {
    const date = new Date('2024-06-27T10:20:30');
    const result = dateToDateTimeString(date);
    expect(result).toBe('2024-06-27T10:20:30.000Z');
  });
  it('should return undefined if the input is undefined', () => {
    const result = dateToDateTimeString(undefined as unknown as Date);
    expect(result).toBeUndefined();
  });
});

describe('dateTimeStringToDate', () => {
  it('should convert an ISO string to a date', () => {
    const dateTimeString = '2024-06-27T10:20:30.000Z';
    const result = dateTimeStringToDate(dateTimeString);

    const expectedDate = new Date(dateTimeString);
    const offset = expectedDate.getTimezoneOffset() / 60;
    expectedDate.setHours(expectedDate.getHours() + offset);

    expect(result?.toISOString()).toBe(expectedDate.toISOString());
  });

  it('should return undefined if the input is undefined', () => {
    const result = dateTimeStringToDate(undefined as unknown as string);
    expect(result).toBeUndefined();
  });
});

describe('ZTimeToOffsetTime', () => {
  it('should adjust the time based on the timezone offset', () => {
    const date = new Date('2023-06-27T12:00:00'); // UTC time
    const result = ZTimeToOffsetTime(date);
    const expectedHours = 12 - date.getTimezoneOffset() / 60;

    expect(result.getHours()).toBe(expectedHours);
  });

  it('should handle different dates correctly', () => {
    const date = new Date('2023-06-27T23:59:00');
    const result = ZTimeToOffsetTime(date);
    const offsetHours = date.getTimezoneOffset() / 60;
    const expectedHours = (23 - offsetHours + 24) % 24;

    expect(result.getHours()).toBe(expectedHours);
  });

  it('should not mutate the original date', () => {
    const date = new Date('2023-06-27T12:00:00Z');
    const originalDate = new Date(date.getTime());
    const result = ZTimeToOffsetTime(date);

    expect(date.getTime()).toBe(originalDate.getTime());
    expect(result).not.toBe(date);
  });
});

describe('ZTimeStringToOffsetTimeString', () => {
  it('should convert a valid time string with timezone offset', () => {
    const time = '12:34';
    const result = ZTimeStringToOffsetTimeString(time);

    const baseDate = new Date();
    baseDate.setHours(12, 34, 0, 0);
    const expectedDate = ZTimeToOffsetTime(baseDate);
    const expectedTime = expectedDate.toString().substring(16, 21);

    expect(result).toBe(expectedTime);
  });

  it('should return undefined if input is undefined', () => {
    const result = ZTimeStringToOffsetTimeString(undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined if input is an empty string', () => {
    const time = '';
    const result = ZTimeStringToOffsetTimeString(time);
    expect(result).toBeUndefined();
  });

  it('should handle edge case for time "00:00"', () => {
    const time = '00:00';
    const result = ZTimeStringToOffsetTimeString(time);

    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    const expectedDate = ZTimeToOffsetTime(baseDate);
    const expectedTime = expectedDate.toString().substring(16, 21);

    expect(result).toBe(expectedTime);
  });

  it('should handle edge case for time "23:59"', () => {
    const time = '23:59';
    const result = ZTimeStringToOffsetTimeString(time);

    const baseDate = new Date();
    baseDate.setHours(23, 59, 0, 0);
    const expectedDate = ZTimeToOffsetTime(baseDate);
    const expectedTime = expectedDate.toString().substring(16, 21);

    expect(result).toBe(expectedTime);
  });
});

describe('timeToHourMinuteString', () => {
  it('should return HH:mm when given a time string in HH:mm:ss format', () => {
    const time = '10:30:00';
    const result = timeToHourMinuteString(time);
    expect(result).toBe('10:30');
  });

  it('should return undefined when given undefined', () => {
    const result = timeToHourMinuteString(undefined);
    expect(result).toBeUndefined();
  });

  it('should handle edge cases like short strings correctly', () => {
    const time = '10:30';
    const result = timeToHourMinuteString(time);
    expect(result).toBe('10:30');
  });

  it('should handle empty string correctly', () => {
    const time = '';
    const result = timeToHourMinuteString(time);
    expect(result).toBe('');
  });

  it('should handle null string correctly', () => {
    const time = null as unknown as string;
    const result = timeToHourMinuteString(time);
    expect(result).toBeNull();
  });

  it('should handle time strings with more than 8 characters correctly', () => {
    const time = '10:30:00 AM';
    const result = timeToHourMinuteString(time);
    expect(result).toBe('10:30');
  });
});
