import { effect, reactive, computed } from '../src';
import { describe, it, expect, vi } from 'vitest';

describe('computed', () => {
  it('computed', () => {
    let data = { age: 1 };
    let obj = reactive(data);
    let fn = vi.fn(() => {});
    let double = computed(() => {
      fn();
      return obj.age * 2;
    });
    expect(fn).toHaveBeenCalledTimes(0);
    expect(double.value).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1);
    obj.age += 1;
    expect(fn).toHaveBeenCalledTimes(1);
    expect(double.value).toBe(4);
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it('computed with effect', () => {
    let data = { age: 10 };
    let obj = reactive(data);
    let fn = vi.fn(n => {});
    let double = computed(() => {
      return obj.age * 2;
    });
    effect(() => {
      fn(double.value);
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(20);
    obj.age++;
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(22);
  });
});
