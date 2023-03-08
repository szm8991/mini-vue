import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src/index'
describe('effect map', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  it('test map', () => {
    const map = reactive(new Map([['a', 1]]))
    let val
    effect(() => {
      val = map.size
    })
    expect(val).toBe(1)
    map.set('b', 2)
    expect(map.get('b')).toBe(2)
    expect(val).toBe(2)
    map.delete('a')
    expect(val).toBe(1)
    expect(map.has('b')).toBe(true)
    expect(map.has('a')).toBe(false)
  })
  it('should observe forEach iteration', () => {
    let dummy: any
    const map = reactive(new Map())
    effect(() => {
      dummy = 0
      map.forEach((num: any) => (dummy += num))
    })
    expect(dummy).toBe(0)
    map.set('key1', 3)
    expect(dummy).toBe(3)
    map.set('key2', 2)
    expect(dummy).toBe(5)
    map.set('key1', 4)
    expect(dummy).toBe(6)
    map.delete('key1')
    expect(dummy).toBe(2)
  })
  it('should observe for of iteration', () => {
    let dummy
    const map = reactive(new Map())
    effect(() => {
      dummy = 0
      for (const [key, num] of map) {
        key
        dummy += num
      }
    })
    expect(dummy).toBe(0)
    map.set('key1', 3)
    expect(dummy).toBe(3)
    map.set('key2', 2)
    expect(dummy).toBe(5)
    map.set('key1', 4)
    expect(dummy).toBe(6)
    map.delete('key1')
    expect(dummy).toBe(2)
  })
  it('should observe keys iteration', () => {
    let dummy
    const map = reactive(new Map())
    effect(() => {
      dummy = 0
      for (const key of map.keys())
        dummy += key
    })
    expect(dummy).toBe(0)
    map.set(3, 3)
    expect(dummy).toBe(3)
    map.set(2, 2)
    expect(dummy).toBe(5)
    map.delete(3)
    expect(dummy).toBe(2)
  })

  it('should observe values iteration', () => {
    let dummy
    const map = reactive(new Map())
    effect(() => {
      dummy = 0
      for (const num of map.values())
        dummy += num
    })

    expect(dummy).toBe(0)
    map.set('key1', 3)
    expect(dummy).toBe(3)
    map.set('key2', 2)
    expect(dummy).toBe(5)
    map.set('key1', 4)
    expect(dummy).toBe(6)
    map.delete('key1')
    expect(dummy).toBe(2)
  })

  it('should observe entries iteration', () => {
    let dummy
    let dummy2
    const map = reactive(new Map())
    effect(() => {
      dummy = ''
      dummy2 = 0

      for (const [key, num] of map.entries()) {
        dummy += key
        dummy2 += num
      }
    })

    expect(dummy).toBe('')
    expect(dummy2).toBe(0)
    map.set('key1', 3)
    expect(dummy).toBe('key1')
    expect(dummy2).toBe(3)
    map.set('key2', 2)
    expect(dummy).toBe('key1key2')
    expect(dummy2).toBe(5)
    // iteration should track mutation of existing entries (#709)
    map.set('key1', 4)
    expect(dummy).toBe('key1key2')
    expect(dummy2).toBe(6)
    map.delete('key1')
    expect(dummy).toBe('key2')
    expect(dummy2).toBe(2)
  })
})
