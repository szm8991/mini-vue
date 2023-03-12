export const extend = Object.assign
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

export const isString = (val: unknown): val is string => typeof val === 'string'
export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'
export const isArray = Array.isArray
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

const camelizeRE = /-(\w)/g
export const camelize = (str: string): string => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
}

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const toHandlerKey = (str: string) =>
  str ? `on${capitalize(str)}` : ''
export * from './normalizeProp'
export * from './shapeFLags'
export * from './toDisplayString'
