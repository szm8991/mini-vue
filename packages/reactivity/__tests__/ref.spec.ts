import { describe, expect, it } from 'vitest'
import { effect, isReactive, isRef, proxyRefs, reactive, ref, unRef } from '../src'

describe('ref', () => {
  it('simple ref', () => {
    const r1 = ref(0)
    const r2 = ref(r1)
    expect(r1).toBe(r2)
    const user = reactive({
      age: 1,
    })
    expect(isRef(r1)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(user)).toBe(false)
  })
  it('unRef', () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })
  it('ref effect', () => {
    const r = ref(0)
    let val
    let calls = 0
    effect(() => {
      calls++
      val = r.value
    })
    expect(calls).toBe(1)
    expect(val).toBe(0)
    r.value++
    expect(calls).toBe(2)
    expect(val).toBe(1)
    r.value = 1
    expect(calls).toBe(2)
    expect(val).toBe(1)
  })
  it('ref reactive effect', () => {
    const r = ref({ name: 'xiaoming' })
    let val
    effect(() => {
      val = r.value.name
    })
    expect(val).toBe('xiaoming')
    expect(isReactive(r.value)).toBe(true)
    r.value.name = 'xiaoxiaoming'
    expect(val).toBe('xiaoxiaoming')
  })
  it('proxyRefs', () => {
    const user = {
      age: ref(10),
      name: 'xiaohong',
    }
    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe('xiaohong');

    (proxyUser as any).age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
  })
})
