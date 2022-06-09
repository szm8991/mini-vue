import { reactive, effect } from '../src/index'
import { describe, it, expect, vi } from 'vitest'
describe('reactive', () => {
  it('reactive array', () => {
    let arr = reactive(['xiaoming'])
    let fn = vi.fn(arg1 => {})
    effect(() => {
      fn(arr[0])
    })
    arr[0] = 1
    expect(fn).toHaveBeenCalledTimes(2) //自动就有这个功能，数组本质也是对象
  })
  it('array length add', () => {
    let arr = reactive(['foo'])
    let dummy
    effect(() => {
      dummy = arr.length
    })
    expect(dummy).toEqual(1)
    arr[1] = 'bar'
    expect(dummy).toEqual(2)
  })
  it('array length cause upadte', () => {
    let arr = reactive(['xiaoming', 'xiaoxiaoming'])
    let fn = vi.fn(arg1 => {})
    let fn1 = vi.fn(arg1 => {})
    effect(() => {
      fn(arr[0])
    })
    effect(() => {
      fn1(arr[1])
    })
    expect(fn).toHaveBeenCalledWith('xiaoming')
    expect(fn1).toHaveBeenCalledWith('xiaoxiaoming')
    arr.length = 1 //触发修改
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledTimes(2)
    expect(fn1).toHaveBeenLastCalledWith(undefined)
  })
  it('traverse array', () => {
    let arr = reactive([1, 2])
    let fn = vi.fn(arg1 => {})
    let ret: any[] = []
    effect(() => {
      for (const key in arr) {
        ret.push(key)
      }
    })
    expect(ret.join(',')).toEqual('0,1')
    arr.length = 1
    expect(ret.join(',')).toEqual('0,1,0')
  })
  it('array push、pop、shift、unshift、splice', () => {
    let arr = reactive([])
    effect(() => {
      arr.push(1)
    })
    effect(() => {
      arr.push(2)
    })
    expect(arr.join(',')).toEqual('1,2')
  })
  it('array find method', () => {
    let arr = reactive([1, 2])
    let bool
    effect(() => {
      bool = arr.includes(1)
    })
    expect(bool).toBe(true)
    let obj = {}
    let arr1 = reactive([obj])
    let bool1
    effect(() => {
      bool1 = arr1.includes(obj) //对象
    })
    expect(bool1).toBe(true)
  })
})
