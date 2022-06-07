import { reactive, isReactive, readonly, isProxy, isReadonly, effect } from '../src/index'
import { describe, it, expect, vi } from 'vitest'
describe('reactive', () => {
  it('retrun a reactive object', () => {
    const original = { name: 'xiaoming' }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
  })
  it('nested reactive', () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
  it('delete property', () => {
    const data = { name: 'xiaoming', age: 18 }
    const obj = reactive(data)
    let fn = vi.fn(arg => {})
    effect(() => {
      fn(obj.name)
    })
    expect(fn).toHaveBeenCalledTimes(1)
    delete obj.name
    expect(fn).toHaveBeenCalledTimes(2)
  })
  it('has', () => {
    const data = { name: 'xiaoming', age: 18 }
    const obj = reactive(data)
    let fn = vi.fn(arg => {})
    effect(() => {
      fn('name' in obj)
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(true)
    delete obj.name
    expect(fn).toHaveBeenCalledWith(false)
    expect(fn).toHaveBeenCalledTimes(2)
  })
  it('ownkeys', () => {
    let obj = reactive({ name: 'xiaoming' })
    let fn = vi.fn(arg => {})
    effect(() => {
      fn(Object.keys(obj))
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(['name'])
    obj.age = 1
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(['name', 'age'])
  })
  it('for in', () => {
    let obj = reactive({ name: 'xiaoming' })
    let fn = vi.fn(() => {})
    effect(() => {
      for (const key in obj) {
        fn()
      }
    })
    expect(fn).toHaveBeenCalledTimes(1)
    obj.name = 'xiaoxiaoming'
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('oldVal equal newVal', () => {
    let obj = reactive({ age: 1 })
    let fn = vi.fn(arg1 => {})
    effect(() => {
      fn(obj.age)
    })
    expect(fn).toHaveBeenCalledTimes(1)
    obj.age = 1
    expect(fn).toHaveBeenCalledTimes(1)
    obj.age = 2
    expect(fn).toHaveBeenCalledTimes(2)
  })
  it('prototype raw', () => {
    let obj = {}
    let proto = { age: 1 }
    let child = reactive(obj)
    let parent = reactive(proto)
    Object.setPrototypeOf(child, parent)
    let fn = vi.fn(arg1 => {})
    effect(() => {
      fn(child.age)
    })
    expect(fn).toHaveBeenCalledTimes(1)
    child.age = 2
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
