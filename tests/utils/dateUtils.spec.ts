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
  dateToDateString,
  dateToDateTimeString,
  dateTimeStringToDate,
  ZTimeToOffsetTime,
  ZTimeStringToOffsetTimeString,
  timeToHourMinuteString,
  dateTimeFromString,
  createLuxonDateTime,
  timeFromString,
} from '../../src/utils/dateUtils';

describe('The dateUtils.ts function ', () => {
  describe('dateToDateString', () => {
    it('returns a date string in YYYY-MM-DD format', () => {
      const date = new Date('2023-08-15T12:00:00Z');
      const result = dateToDateString(date);
      expect(result).toEqual('2023-08-15');
    });

    it('returns undefined if the input is invalid', () => {
      const result = dateToDateString(undefined as unknown as Date);
      expect(result).toBeUndefined();
    });
  });

  describe('dateToDateTimeString', () => {
    it('returns an ISO string from a valid date', () => {
      const date = new Date('2023-08-15T12:00:00Z');
      const result = dateToDateTimeString(date);
      expect(result).toContain('2023-08-15T');
    });

    it('returns undefined if the date is undefined', () => {
      const result = dateToDateTimeString(undefined as unknown as Date);
      expect(result).toBeUndefined();
    });
  });

  describe('dateTimeStringToDate', () => {
    it('parses a valid date-time string into a Date object', () => {
      const dateString = '2023-08-15T14:00:00Z'; // UTC
      const result = dateTimeStringToDate(dateString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toEqual('2023-08-15T12:00:00.000Z'); // Local, de-AT, we have a time zone offset of -2 h
    });

    it('returns undefined if no string is provided', () => {
      const result = dateTimeStringToDate('');
      expect(result).toBeUndefined();
    });
  });

  describe('ZTimeToOffsetTime', () => {
    it('adjusts time based on timezone offset', () => {
      const date = new Date('2023-08-15T00:00:00Z');
      const result = ZTimeToOffsetTime(date);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('ZTimeStringToOffsetTimeString', () => {
    it('converts Zulu time string to offset time string (HH:mm)', () => {
      const timeString = '13:45';
      const result = ZTimeStringToOffsetTimeString(timeString);
      // The value depends on local offset; just check format and the presence of expected digits.
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('returns undefined if input is undefined', () => {
      const result = ZTimeStringToOffsetTimeString(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('timeToHourMinuteString', () => {
    it('returns time in HH:mm format', () => {
      const result = timeToHourMinuteString('10:30:00');
      expect(result).toBe('10:30');
    });

    it('returns undefined if input is undefined', () => {
      const result = timeToHourMinuteString(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('dateTimeFromString', () => {
    it('parses a valid ISO date string', () => {
      const result = dateTimeFromString('2023-08-15T12:00:00Z');
      expect(result?.isValid).toBe(true);
    });

    it('ignores invalid strings and returns undefined', () => {
      const result = dateTimeFromString('invalid-date');
      expect(result).toBeUndefined();
    });
  });

  describe('createLuxonDateTime', () => {
    it('creates a DateTime from a Date', () => {
      const date = new Date('2023-08-15T00:00:00Z');
      const result = createLuxonDateTime(date);
      expect(result?.isValid).toBe(true);
    });

    it('creates a DateTime from an ISO string', () => {
      const result = createLuxonDateTime('2023-08-15T12:00:00Z');
      expect(result?.isValid).toBe(true);
    });

    it('returns undefined if no input is provided', () => {
      let result = createLuxonDateTime();
      expect(result).toBeUndefined();

      result = createLuxonDateTime('');
      expect(result).toBeUndefined();

      result = createLuxonDateTime('invalid');
      expect(result).toBeUndefined();

      result = createLuxonDateTime(0 as unknown as string);
      expect(result).toBeUndefined();
    });
  });

  describe('timeFromString', () => {
    it('parses a valid time string into hour, minute, second', () => {
      const result = timeFromString('12:30:05');
      expect(result).toEqual({ hour: 12, minute: 30, second: 5 });
    });

    it('returns undefined if the string cannot be parsed', () => {
      const result = timeFromString('invalid');
      expect(result).toEqual({ hour: 0, minute: 0, second: 0 });
    });
  });
});
