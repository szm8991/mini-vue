import { describe, expect, it, vi } from 'vitest'
import { computed, effect, reactive } from '../src'

describe('computed', () => {
  it('computed', () => {
    const data = { age: 1 }
    const obj = reactive(data)
    const fn = vi.fn(() => {})
    const double = computed(() => {
      fn()
      return obj.age * 2
    })
    expect(fn).toHaveBeenCalledTimes(0)
    expect(double.value).toBe(2)
    expect(fn).toHaveBeenCalledTimes(1)
    obj.age += 1
    expect(fn).toHaveBeenCalledTimes(1)
    expect(double.value).toBe(4)
    expect(fn).toHaveBeenCalledTimes(2)
  })
  it('computed with effect', () => {
    const data = { age: 10 }
    const obj = reactive(data)
    const fn = vi.fn((n) => {})
    const double = computed(() => {
      return obj.age * 2
    })
    effect(() => {
      fn(double.value)
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(20)
    obj.age++
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(22)
  })
})
