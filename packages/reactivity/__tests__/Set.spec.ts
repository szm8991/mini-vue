import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src/index'
describe('effect set', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  it('test set ', () => {
    const set = reactive(new Set([1]))
    let val
    effect(() => {
      val = set.size
    })
    expect(val).toBe(1)
    set.add(2)
    expect(val).toBe(2)
    expect(set.has(2)).toBe(true)
    set.delete(1)
    expect(val).toBe(1)
  })

  it('should observe forEach iteration', () => {
    let dummy: any
    const set = reactive(new Set())
    effect(() => {
      dummy = 0
      set.forEach(num => (dummy += num))
    })
    expect(dummy).toBe(0)
    set.add(2)
    set.add(1)
    expect(dummy).toBe(3)
    set.delete(2)
    expect(dummy).toBe(1)
  })

  it('should observe for of iteration', () => {
    let dummy
    const set = reactive(new Set() as Set<number>)
    effect(() => {
      dummy = 0
      for (const num of set) {
        // console.log(num)
        dummy += num
      }
    })
    expect(dummy).toBe(0)
    set.add(2)
    set.add(1)
    expect(dummy).toBe(3)
    set.delete(2)
    expect(dummy).toBe(1)
  })

  it('should observe values iteration', () => {
    let dummy
    const set = reactive(new Set() as Set<number>)
    effect(() => {
      dummy = 0
      for (const num of set.values())
        dummy += num
    })

    expect(dummy).toBe(0)
    set.add(2)
    set.add(1)
    expect(dummy).toBe(3)
    set.delete(2)
    expect(dummy).toBe(1)
  })

  it('should observe keys iteration', () => {
    let dummy
    const set = reactive(new Set() as Set<number>)
    effect(() => {
      dummy = 0
      for (const num of set.keys())
        dummy += num
    })
    expect(dummy).toBe(0)
    set.add(2)
    set.add(1)
    expect(dummy).toBe(3)
    set.delete(2)
    expect(dummy).toBe(1)
  })

  it('should observe entries iteration', () => {
    let dummy
    const set = reactive(new Set<number>())
    effect(() => {
      dummy = 0

      for (const [key, num] of set.entries()) {
        key
        dummy += num
      }
    })

    expect(dummy).toBe(0)
    set.add(2)
    set.add(1)
    expect(dummy).toBe(3)
    set.delete(2)
    expect(dummy).toBe(1)
  })
})
