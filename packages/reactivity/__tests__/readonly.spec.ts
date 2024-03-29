import { describe, expect, it, vi } from 'vitest'
import { isProxy, isReactive, isReadonly, readonly } from '../src/index'
describe('readonly', () => {
  it('should make nested values readonly', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(isProxy(wrapped)).toBe(true)
    expect(isReactive(wrapped)).toBe(false)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isReadonly(original)).toBe(false)
    expect(isReactive(wrapped.bar)).toBe(false)
    expect(isReadonly(wrapped.bar)).toBe(true)
    expect(isReactive(original.bar)).toBe(false)
    expect(isReadonly(original.bar)).toBe(false)
    console.warn = vi.fn()
    wrapped.foo = 2
    expect(console.warn).toBeCalled()
    expect(wrapped.foo).toBe(1)
  })
})
