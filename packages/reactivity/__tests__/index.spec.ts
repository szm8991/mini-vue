import { add } from '../src/index';
import { describe, it, expect } from 'vitest';
describe('reactive', () => {
  it('init', () => {
    expect(add(1, 1)).toBe(2);
  });
  it('test ssh', () => {
    expect(true).toBe(true);
  });
});
