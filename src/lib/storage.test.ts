import { describe, expect, it } from 'vitest';
import { loadStoredValue, saveStoredValue } from './storage';

describe('local persistence', () => {
  it('round-trips JSON values through browser storage', () => {
    expect(saveStoredValue('settings', { fontSize: 14 }, window.localStorage)).toBe(true);
    expect(loadStoredValue('settings', { fontSize: 12 }, window.localStorage)).toEqual({ fontSize: 14 });
  });

  it('uses the fallback for missing or malformed values', () => {
    expect(loadStoredValue('missing', ['default'], window.localStorage)).toEqual(['default']);
    window.localStorage.setItem('broken', '{not-json');
    expect(loadStoredValue('broken', ['default'], window.localStorage)).toEqual(['default']);
  });

  it('reports write failures without losing the in-memory experience', () => {
    const failingStorage: Storage = {
      length: 0,
      clear: () => undefined,
      getItem: () => null,
      key: () => null,
      removeItem: () => undefined,
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError');
      },
    };

    expect(saveStoredValue('state', { value: 1 }, failingStorage)).toBe(false);
  });
});
