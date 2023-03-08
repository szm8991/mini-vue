import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effect, reactive, shallowReactive } from '../src/index'
describe('effect', () => {
  beforeEach(() => {
    // 使用假的时间
    vi.useFakeTimers()
  })
  it('should run once without lazy', () => {
    const toCall = vi.fn(() => {})
    effect(toCall)
    expect(toCall).toHaveBeenCalledTimes(1)
  })
  it('should run when reactive change', () => {
    let dummy
    const counter = reactive({ num: 0 })
    effect(() => (dummy = counter.num))
    expect(dummy).toBe(0)
    counter.num = 7
    expect(dummy).toBe(7)
  })
  it('should handle multiple effects', () => {
    let dummy1, dummy2
    const counter = reactive({ num: 0 })
    effect(() => (dummy1 = counter.num))
    effect(() => (dummy2 = counter.num))
    expect(dummy1).toBe(0)
    expect(dummy2).toBe(0)
    counter.num++
    expect(dummy1).toBe(1)
    expect(dummy2).toBe(1)
  })
  it('cleanup and re-effect', () => {
    const data = {
      ok: true,
      text: 'xiaoming',
    }
    let message = ''
    const obj = reactive(data)
    const fn = vi.fn(() => {
      message = obj.ok ? obj.text : 'none'
    })
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(message).toBe('xiaoming')
    obj.ok = false
    expect(message).toBe('none')
    expect(fn).toHaveBeenCalledTimes(2)
    obj.text = 'xiaoxiaoming'
    expect(fn).toHaveBeenCalledTimes(2)
  })
  it('basic reactive', () => {
    const ret = reactive({
      name: '玩转Vue3',
      info: {
        price: 129,
        type: 'f2e',
      },
    })
    let price
    effect(() => {
      price = ret.info.price
    })
    expect(price).toBe(129)
    ret.info.price++
    expect(price).toBe(130)
  })
  it('basic shalldowReactive', () => {
    const ret = shallowReactive({ num: 0 })
    let val
    effect(() => {
      val = ret.num
    })
    expect(val).toBe(0)
    ret.num++
    expect(val).toBe(1)
    ret.num = 10
    expect(val).toBe(10)
  })
  it('deeply shalldowReactive', () => {
    const ret = shallowReactive({
      name: '玩转Vue3',
      info: {
        price: 129,
        type: 'f2e',
      },
    })
    let price
    effect(() => {
      price = ret.info.price
    })
    expect(price).toBe(129)
    ret.info.price++
    expect(price).toBe(129)
  })
  it('effect stack', () => {
    const data = { foo: true, bar: true }
    const obj = reactive(data)
    let dummy1, dummy2
    const fn1 = vi.fn(() => {})
    const fn2 = vi.fn(() => {})
    effect(() => {
      fn1()
      effect(() => {
        fn2()
        dummy2 = obj.bar
      })
      dummy1 = obj.foo
    })
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    obj.bar = false
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(2)
    obj.foo = false
    expect(fn1).toHaveBeenCalledTimes(2)
    expect(fn2).toHaveBeenCalledTimes(3)
  })
  it('effect lazy', () => {
    const data = { age: 1 }
    const obj = reactive(data)
    const fn = vi.fn((n) => {})
    const effectFn = effect(
      () => {
        fn(obj.age)
      },
      { lazy: true },
    )
    expect(fn).toHaveBeenCalledTimes(0)
    effectFn()
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('effect scheduler', async () => {
    const data = { age: 1 }
    const obj = reactive(data)
    const arr: any[] = []
    effect(
      () => {
        arr.push(obj.age)
      },
      {
        scheduler(fn) {
          setTimeout(fn) // 下一个任务循环
        },
      },
    )
    const arr1: any[] = []
    effect(() => {
      arr1.push(obj.age)
    })
    obj.age++
    arr.push('end')
    arr1.push('end')
    // set
    await vi.runAllTimers()
    expect(arr.join(',')).toBe('1,end,2')
    expect(arr1.join(',')).toBe('1,2,end')
  })
  it('prxy的无限递归问题', () => {
    const testFn = vi.fn(() => {
      const data = { age: 1 }
      const obj = reactive(data)
      effect(() => {
        obj.age++
      })
    })
    expect(() => testFn()).not.toThrowError('Maximum call stack size exceeded')
  })
  it('effect scheduler jobQueue', async () => {
    const data = { age: 1 }
    const obj = reactive(data)
    const jobQueue = new Set<Function>()
    const p = Promise.resolve()
    let isFlushing = false
    function flushJob() {
      if (isFlushing)
        return
      isFlushing = true
      p.then(() => {
        jobQueue.forEach(job => job())
      }).finally(() => {
        isFlushing = false
      })
    }
    const fnOb = {
      count(n) {
        // console.log(n)
        return n
      },
    }
    const fn = vi.spyOn(fnOb, 'count')
    effect(
      () => {
        fnOb.count(obj.age)
      },
      {
        scheduler(fn) {
          jobQueue.add(fn)
          flushJob()
        },
      },
    )
    obj.age++
    obj.age++
    obj.age++
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
    await vi.runAllTicks() // vue的微任务优化
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(4)
  })
  it('stop effect', () => {
    const data = reactive({
      name: 'xiaoming',
    })
    const fn = vi.fn((...args) => {})
    const effectFn = effect(() => {
      fn(data.name)
    })
    data.name = 'xiaoxiaoming'
    expect(fn).toHaveBeenCalledTimes(2)
    effectFn.stop()
    data.name = 'xiaoming'
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
