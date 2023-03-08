export const extend = Object.assign
export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}
export const isString = val => typeof val === 'string'
export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string => objectToString.call(value)

export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}
export const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key)

export const shouldSetAsProps = (el, key, value) => {
  if (key === 'form' && el.tagName === 'INPUT')
    return false
  // in 判断是否为 dom 属性
  return key in el
}

export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'

export * from './shapeFLags'
