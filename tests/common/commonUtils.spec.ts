/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { describe, it, expect } from 'vitest';
import { isObjectEmpty, shortenText } from '../../src/utils/commonUtils';

describe('isObjectEmpty', () => {
  it('should return true for an empty object', () => {
    const obj = {};
    const result = isObjectEmpty(obj);
    expect(result).toBe(true);
  });

  it('should return false for a non-empty object', () => {
    const obj = { key: 'value' };
    const result = isObjectEmpty(obj);
    expect(result).toBe(false);
  });

  it('should return true for undefined', () => {
    const obj = undefined;
    const result = isObjectEmpty(obj);
    expect(result).toBe(true);
  });

  it('should return true for null', () => {
    const obj = null;
    const result = isObjectEmpty(obj);
    expect(result).toBe(true);
  });

  it('should return true for an object with no own properties', () => {
    const obj = Object.create(null);
    const result = isObjectEmpty(obj);
    expect(result).toBe(true);
  });
});

describe('shortenText', () => {
  it('should shorten text to maxLength and append default', () => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    const maxLength = 20;
    const expected = 'Lorem ipsum dolor si...';
    const result = shortenText(text, maxLength);
    expect(result).toBe(expected);
  });

  it('should return undefined if input text is undefined', () => {
    const result = shortenText(undefined);
    expect(result).toBeUndefined();
  });

  it('should return empty string if input text is empty', () => {
    const text = '';
    const result = shortenText(text);
    expect(result).toBe('');
  });

  it('should not shorten text if its length is less than maxLength', () => {
    const text = 'Short text';
    const maxLength = 20;
    const result = shortenText(text, maxLength);
    expect(result).toBe(text);
  });

  it('should shorten text to maxLength and append custom append string', () => {
    const text = 'This is a long text that needs to be shortened.';
    const maxLength = 20;
    const append = '...read more';
    const expected = 'This is a long text ...read more';
    const result = shortenText(text, maxLength, append);
    expect(result).toBe(expected);
  });
});
