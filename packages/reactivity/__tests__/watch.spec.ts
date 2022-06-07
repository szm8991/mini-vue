import { reactive, watch } from '../src'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
function sleep(time: number) {
  return new Promise<number>((resolve, reject) => {
    setTimeout(() => {
      resolve(time)
    }, time)
  })
}
describe('watch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  it('basic watch', () => {
    let data = { age: 1 }
    let obj = reactive(data)
    let fn = vi.fn((a1, a2) => {})
    watch(
      () => obj.age,
      (newValue, oldValue) => {
        fn(newValue, oldValue)
      }
    )
    expect(fn).toHaveBeenCalledTimes(0)
    obj.age++
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2, 1)
  })

  it('options watch', async () => {
    let data = { age: 1 }
    let obj = reactive(data)
    let fn = vi.fn((a1, a2) => {})
    watch(
      () => obj.age,
      (newValue, oldValue) => {
        fn(newValue, oldValue)
      },
      {
        immediate: true,
        flush: 'post',
      }
    )
    expect(fn).toHaveBeenCalledTimes(1)
    // newValue为obj.age,oldValue为undefined
    expect(fn).toHaveBeenCalledWith(1, undefined)
    obj.age++
    await vi.runAllTicks()
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(2, 1)
  })
  it('options watch object', async () => {
    let data = { age: 1 }
    let obj = reactive(data)
    let fn = vi.fn((a1, a2) => {})
    watch(
      obj,
      (newValue, oldValue) => {
        fn(newValue, oldValue)
      },
      {
        immediate: true,
      }
    )
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith({ age: 1 }, undefined)
    obj.age++
    expect(fn).toHaveBeenCalledTimes(2)
    // 源码中oldValue=newValue，导致watch对象是oldValue和newValue指向同一对象
    expect(fn).toHaveBeenCalledWith({ age: 2 }, { age: 2 })
  })
  it('options watch object', async () => {
    let data = { age: 1 }
    let obj = reactive(data)
    let finalData
    let expired = false
    watch(obj, async (newValue, oldValue, onInvalidate) => {
      onInvalidate(() => {
        expired = true
      })
      await sleep(1000)
    })
    obj.age++
    setTimeout(() => {
      obj.age++
    }, 200)
    await vi.runAllTicks()
    await vi.runAllTimers()
    expect(expired).toBe(true)
  })
})
