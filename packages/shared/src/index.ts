export const isObject = val => {
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
