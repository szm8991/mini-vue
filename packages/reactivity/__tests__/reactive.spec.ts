import { reactive, isReactive, readonly, isProxy, isReadonly } from '../src/index'
import { describe, it, expect } from 'vitest'
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
  // it('should make nested values readonly', () => {
  //   const original = { foo: 1, bar: { baz: 2 } }
  //   const wrapped = readonly(original)
  //   expect(wrapped).not.toBe(original)
  //   expect(isProxy(wrapped)).toBe(true)
  //   expect(isReactive(wrapped)).toBe(false)
  //   expect(isReadonly(wrapped)).toBe(true)
  //   expect(isReactive(original)).toBe(false)
  //   expect(isReadonly(original)).toBe(false)
  //   expect(isReactive(wrapped.bar)).toBe(false)
  //   expect(isReadonly(wrapped.bar)).toBe(true)
  //   expect(isReactive(original.bar)).toBe(false)
  //   expect(isReadonly(original.bar)).toBe(false)
  //   // get
  //   expect(wrapped.foo).toBe(1)
  // })
})
