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
  validateEmail,
  validateTelephoneNumber,
} from '../../src/utils/stringUtils';

describe('The validateEmail method', () => {
  it('should return true for valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag+sorting@example.com')).toBe(true);
    expect(validateEmail('user@subdomain.example.com')).toBe(true);
    expect(validateEmail('user123@example.co.uk')).toBe(true);
    expect(validateEmail('u@a.at')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(validateEmail('plainaddress')).toBe(false);
    expect(validateEmail('@missingusername.com')).toBe(false);
    expect(validateEmail('username@.com')).toBe(false);
    expect(validateEmail('username@com')).toBe(false);
    expect(validateEmail('username@com.')).toBe(false);
    expect(validateEmail('user@.example.com')).toBe(false);
  });

  it('should handle falsy values as invalid', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(false as unknown as string)).toBe(false);
    expect(validateEmail('0')).toBe(false);
    expect(validateEmail(0 as unknown as string)).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });

  it('should handle input with spaces as invalid', () => {
    expect(validateEmail(' user@example.com ')).toBe(false);
    expect(validateEmail('user @example.com')).toBe(false);
  });
});

describe('The validateTelephoneNumber method', () => {
  it('should return true for valid telephone numbers', () => {
    expect(validateTelephoneNumber('1234567890')).toBe(true);
    expect(validateTelephoneNumber('+1234567890')).toBe(true);
    expect(validateTelephoneNumber('(123) 456-7890')).toBe(true);
    expect(validateTelephoneNumber('123-456-7890')).toBe(true);
    expect(validateTelephoneNumber('123.456.7890')).toBe(true);
    expect(validateTelephoneNumber('123/456 7890')).toBe(true);
    expect(validateTelephoneNumber('123/4567890')).toBe(true);
    expect(validateTelephoneNumber('0664 / 456 789 0')).toBe(true);
    expect(validateTelephoneNumber('12345')).toBe(true);
    expect(validateTelephoneNumber('123-456')).toBe(true);
    expect(validateTelephoneNumber(' 1234567890 ')).toBe(true);
    expect(validateTelephoneNumber('123 456 7890')).toBe(true);
    expect(validateTelephoneNumber('(123)456-7890')).toBe(true);
    expect(validateTelephoneNumber('+1234567890')).toBe(true);
    expect(validateTelephoneNumber('+123 (456) 7890')).toBe(true);
  });

  it('should return false for invalid telephone numbers', () => {
    expect(validateTelephoneNumber('')).toBe(false);
    expect(validateTelephoneNumber('0')).toBe(false);
    expect(validateTelephoneNumber('12')).toBe(false);
    expect(validateTelephoneNumber('abcdef')).toBe(false);
    expect(validateTelephoneNumber('123 456 7890 abc')).toBe(false);
    expect(validateTelephoneNumber('abc 123 456 7890')).toBe(false);
  });
});
