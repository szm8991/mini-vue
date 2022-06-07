import { reactive, isReactive, shallowReactive, isShallow } from '../src/index'
import { describe, it, expect, vi } from 'vitest'
describe('shallowReactive', () => {
  it('should not make non-reactive properties reactive', () => {
    const props = shallowReactive({ n: { foo: 1 } })
    expect(isReactive(props.n)).toBe(false)
  })
  it('should keep reactive properties reactive', () => {
    const props = shallowReactive({ n: reactive({ foo: 1 }) })
    props.n = reactive({ foo: 2 })
    expect(isReactive(props.n)).toBe(true)
  })
  it('should allow shallow and normal reactive for same target', () => {
    const original = { foo: {} }
    const shallowProxy = shallowReactive(original)
    const reactiveProxy = reactive(original)
    expect(shallowProxy).not.toBe(reactiveProxy)
    expect(isReactive(shallowProxy.foo)).toBe(false)
    expect(isReactive(reactiveProxy.foo)).toBe(true)
  })

  it('isShallow', () => {
    expect(isShallow(shallowReactive({}))).toBe(true)
  })
})
