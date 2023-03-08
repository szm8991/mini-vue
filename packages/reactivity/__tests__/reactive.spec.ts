import { describe, expect, it, vi } from 'vitest'
import { effect, isReactive, reactive } from '../src/index'
describe('reactive', () => {
  it('retrun a reactive object', () => {
    const original = { name: 'xiaoming' }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
  })
  it('reactive map', () => {
    const original = { name: 'xiaoming' }
    const observed1 = reactive(original)
    const observed2 = reactive(original)
    expect(observed1).toBe(observed2)
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
    const fn = vi.fn((arg) => {})
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
    const fn = vi.fn((arg) => {})
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
    const obj = reactive({ name: 'xiaoming' })
    const fn = vi.fn((arg) => {})
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
    const obj = reactive({ name: 'xiaoming' })
    const fn = vi.fn(() => {})
    effect(() => {
      for (const key in obj)
        fn()
    })
    expect(fn).toHaveBeenCalledTimes(1)
    obj.name = 'xiaoxiaoming'
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('oldVal equal newVal', () => {
    const obj = reactive({ age: 1 })
    const fn = vi.fn((arg1) => {})
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
    const obj = {}
    const proto = { age: 1 }
    const child = reactive(obj)
    const parent = reactive(proto)
    Object.setPrototypeOf(child, parent)
    const fn = vi.fn((arg1) => {})
    effect(() => {
      fn(child.age)
    })
    expect(fn).toHaveBeenCalledTimes(1)
    child.age = 2
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
