import { describe, it, expect } from 'vitest';
import { validateEmail, validateTel } from '../../src/utils/stringUtils';

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

describe('The validateTel method', () => {
  it('should return true for valid telephone numbers', () => {
    expect(validateTel('1234567890')).toBe(true);
    expect(validateTel('+1234567890')).toBe(true);
    expect(validateTel('(123) 456-7890')).toBe(true);
    expect(validateTel('123-456-7890')).toBe(true);
    expect(validateTel('123.456.7890')).toBe(true);
    expect(validateTel('123/456 7890')).toBe(true);
    expect(validateTel('123/4567890')).toBe(true);
    expect(validateTel('0664 / 456 789 0')).toBe(true);
    expect(validateTel('12345')).toBe(true);
    expect(validateTel('123-456')).toBe(true);
    expect(validateTel(' 1234567890 ')).toBe(true);
    expect(validateTel('123 456 7890')).toBe(true);
    expect(validateTel('(123)456-7890')).toBe(true);
    expect(validateTel('+1234567890')).toBe(true);
    expect(validateTel('+123 (456) 7890')).toBe(true);
  });

  it('should return false for invalid telephone numbers', () => {
    expect(validateTel('')).toBe(false);
    expect(validateTel('0')).toBe(false);
    expect(validateTel('12')).toBe(false);
    expect(validateTel('abcdef')).toBe(false);
    expect(validateTel('123 456 7890 abc')).toBe(false);
    expect(validateTel('abc 123 456 7890')).toBe(false);
  });
});
