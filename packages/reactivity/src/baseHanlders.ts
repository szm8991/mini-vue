import { track, trigger } from './effect'
import {
  reactive,
  readonly,
  ReactiveFlags,
  reactiveMap,
  shallowReactiveMap,
  readonlyMap,
} from './reactive'
import { TrackOpTypes, TriggerOpTypes } from './operations'
const get = createGetter()
const set = createSetter()
const shallowReactiveGet = createGetter(true)
const readonlyReactiveGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)
function createGetter(isShallow: boolean = false, isReadonly: boolean = false) {
  return function get(target, key, receiver) {
    // 是不是已经存在map中，避免重复创建
    // const isExistMap = () =>
    //   key === ReactiveFlags.RAW &&
    //   (receiver === reactiveMap.get(target) ||
    //     receiver === shallowReactiveMap.get(target) ||
    //     receiver === readonlyMap.get(target))
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow
    } else if (key === ReactiveFlags.RAW) {
      return target
    }
    // if (isExistMap()) {
    //   return target
    // }
    // 解决getter访问时this指向target而不是代理对象的问题
    const res = Reflect.get(target, key, receiver)
    if (!isReadonly) {
      track(target, key, TrackOpTypes.GET)
    }
    if (isShallow) {
      return res
    }
    // deep-lazy
    if (typeof res === 'object' && res !== null) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}
function createSetter(isShallow: boolean = false, isReadonly: boolean = false) {
  return function set(target, key, newValue, receiver) {
    if (isReadonly) {
      console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target)
      return true
    }
    const oldValue = target[key]
    const type = Object.prototype.hasOwnProperty.call(target, key)
      ? TriggerOpTypes.SET
      : TriggerOpTypes.ADD
    const res = Reflect.set(target, key, newValue, receiver)
    if (target === receiver[ReactiveFlags.RAW]) {
      // if(oldValue !== newValue && (oldValue === oldValue || newValue === newValue))
      if (!Object.is(oldValue, newValue)) trigger(target, key, type)
    }
    return res
  }
}

function has(target, key) {
  const res = Reflect.has(target, key)
  track(target, key, TrackOpTypes.HAS)
  return res
}
function deleteProperty(target, key) {
  // if (readonly) {
  //   console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target)
  //   return true
  // }
  const hadKey = Object.prototype.hasOwnProperty.call(target, key)
  const result = Reflect.deleteProperty(target, key)
  if (result && hadKey) trigger(target, key, TriggerOpTypes.DELETE)
  return result
}
export const ITERATE_KEY = Symbol('iterate')
function ownKeys(target) {
  const key = Array.isArray(target) ? 'length' : ITERATE_KEY
  track(target, key, TrackOpTypes.ITERATE)
  return Reflect.ownKeys(target)
}
export const mutableHandlers = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys,
}
export const shallowReactiveHandlers = {
  get: shallowReactiveGet,
  set,
  deleteProperty,
  has,
  ownKeys,
}
export const readonlyHandlers = {
  get: readonlyReactiveGet,
  set,
  deleteProperty,
  has,
  ownKeys,
}
export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set,
  deleteProperty,
  has,
  ownKeys,
}
