import { describe, expect, it } from 'vitest'
import { isObject } from '../src'

describe('测试工具函数', () => {
  it('isObject', () => {
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(true)
    expect(isObject(1)).toBe(false)
    expect(isObject(false)).toBe(false)
    expect(isObject(new Set())).toBe(true)
    expect(isObject(new Date())).toBe(true)
  })
})
