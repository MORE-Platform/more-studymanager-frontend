import { describe, it, expect } from 'vitest';
import { validateEmail } from '../../src/utils/stringUtils';

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
