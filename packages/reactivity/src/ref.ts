import { isObject } from '@ming/shared'
import { track, trigger } from './effect'
import { reactive } from './reactive'
function convert(val) {
  return isObject(val) ? reactive(val) : val
}
class RefImpl<T> {
  private _rawValue: T
  private _val: T
  public readonly __isRef = true
  constructor(val: T) {
    this._rawValue = val
    this._val = convert(val)
  }

  get value() {
    track(this, 'value')
    return this._val
  }

  set value(val) {
    if (val !== this._val) {
      this._rawValue = val
      this._val = convert(val)
      trigger(this, 'value')
    }
  }
}
export function isRef(val) {
  return !!(val && val.__isRef)
}
function createRef(rawVal, isShallow: boolean) {
  if (isRef(rawVal))
    return rawVal
  return new RefImpl(rawVal)
}
export function ref(val?) {
  return createRef(val, false)
}
export function shallowRef(value?) {
  return createRef(value, true)
}
export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

const shallowUnwrapHandlers = {
  get(target, key, receiver) {
    return unRef(Reflect.get(target, key, receiver))
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    if (isRef(oldValue) && !isRef(value))
      return (target[key].value = value)
    else
      return Reflect.set(target, key, value, receiver)
  },
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, shallowUnwrapHandlers)
}
