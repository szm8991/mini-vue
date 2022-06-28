import { startTrack, stopTrack, track, trigger } from './effect'
import { hasOwn } from '@ming/shared'
import {
  reactive,
  readonly,
  ReactiveFlags,
  reactiveMap,
  shallowReactiveMap,
  readonlyMap,
} from './reactive'
import { TrackOpTypes, TriggerOpTypes } from './operations'
const arrayInstrumentations = {}
;['push', 'pop', 'shift', 'unshift'].forEach(method => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function (...args) {
    stopTrack()
    const res = originMethod.apply(this, args)
    startTrack()
    return res
  }
})
;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function (...args) {
    // this 是代理对象，先在代理对象中查找，将结果存储到 res 中
    let res = originMethod.apply(this, args)
    if (res === false) {
      // res 为 false 说明没找到，在通过 this.raw 拿到原始数组，再去原始数组中查找，并更新 res 值
      res = originMethod.apply(this[ReactiveFlags.RAW], args)
    }
    // 返回最终的结果
    return res
  }
})
const get = createGetter()
const set = createSetter()
const shallowReactiveGet = createGetter(true)
const readonlyReactiveGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)
function createGetter(isShallow: boolean = false, isReadonly: boolean = false) {
  return function get(target, key, receiver) {
    // 是不是已经存在map中，避免重复创建
    const isExistMap = () =>
      key === ReactiveFlags.RAW &&
      (receiver === reactiveMap.get(target) ||
        receiver === shallowReactiveMap.get(target) ||
        receiver === readonlyMap.get(target))
    if (isExistMap()) {
      return target
    }
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow
    } else if (key === ReactiveFlags.RAW) {
      return target
    }

    if (Array.isArray(target) && hasOwn(arrayInstrumentations, key))
      return Reflect.get(arrayInstrumentations, key, receiver)
    // 解决getter访问时this指向target而不是代理对象的问题
    const res = Reflect.get(target, key, receiver)
    if (!isReadonly && typeof key != 'symbol') {
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
    const type = Array.isArray(target)
      ? Number(key) < target.length
        ? TriggerOpTypes.SET
        : TriggerOpTypes.ADD // 越界标记为add
      : hasOwn(target, key)
      ? TriggerOpTypes.SET
      : TriggerOpTypes.ADD
    const res = Reflect.set(target, key, newValue, receiver)
    if (target === receiver[ReactiveFlags.RAW]) {
      // if(oldValue !== newValue && (oldValue === oldValue || newValue === newValue))
      // 判断新老值是否一样，如果不一样，则触发trigger
      if (!Object.is(oldValue, newValue)) trigger(target, key, type, newValue)
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
