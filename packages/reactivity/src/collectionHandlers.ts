import { hasChanged, isMap } from '@ming/shared'
import { ITERATE_KEY } from './baseHanlders'
import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { ReactiveFlags, reactive } from './reactive'
export const MAP_KEY_ITERATE_KEY = Symbol('map-key-iterate')
const mutableInstrumentations = {
  add(key) {
    const target = this[ReactiveFlags.RAW]
    const hadKey = target.has(key)
    const res = target.add(key)
    if (!hadKey)
      trigger(target, key, TriggerOpTypes.ADD)
    return res
  },
  delete(key) {
    const target = this[ReactiveFlags.RAW]
    const hadKey = target.has(key)
    const res = target.delete(key)
    if (hadKey)
      trigger(target, key, TriggerOpTypes.DELETE)
    return res
  },
  get(key) {
    const target = this[ReactiveFlags.RAW]
    const had = target.has(key)
    track(target, key, TrackOpTypes.GET)
    if (had) {
      const res = target.get(key)
      return typeof res === 'object' ? reactive(res) : res
    }
  },
  set(key, value) {
    const target = this[ReactiveFlags.RAW]
    const had = target.has(key)
    const oldValue = target.get(key)
    const rawValue = value.raw || value
    target.set(key, rawValue)
    if (!had)
      trigger(target, key, TriggerOpTypes.ADD)
    else if (hasChanged(value, oldValue))
      trigger(target, key, TriggerOpTypes.SET)
  },
  has(key) {
    const target = this[ReactiveFlags.RAW]
    const res = target.has(key)
    track(target, key, TrackOpTypes.HAS)
    return res
  },
  forEach(callback, thisArg) {
    const wrap = val => (typeof val === 'object' ? reactive(val) : val)
    const target = this[ReactiveFlags.RAW]
    track(target, ITERATE_KEY)
    target.forEach((v, k) => {
      callback.call(thisArg, wrap(v), wrap(k), this)
    })
  },
  clear() {
    const target = this[ReactiveFlags.RAW]
    const hadItems = target.size !== 0
    const oldTarget = isMap(target) ? new Map(target) : new Set(target)
    // forward the operation before queueing reactions
    const result = target.clear()
    if (hadItems)
      trigger(target, undefined, TriggerOpTypes.CLEAR, undefined)

    return result
  },
  [Symbol.iterator]: createIterableMethod(Symbol.iterator),
  entries: createIterableMethod('entries'),
  keys: keysIterationMethod,
  values: valuesIterationMethod,
}
function createIterableMethod(method) {
  return function iterationMethod(this: any) {
    const wrap = val => (typeof val === 'object' ? reactive(val) : val)
    const isMap = target => Object.prototype.toString.call(target) === '[object Map]'
    const target = this[ReactiveFlags.RAW]
    const targetIsMap = isMap(target)
    const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap)
    // set和map的默认迭代器不同
    const itr = target[method]()
    track(target, ITERATE_KEY)
    return {
      next() {
        const { value, done } = itr.next()
        return done
          ? { value, done }
          : {
              value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
              done,
            }
      },
      [Symbol.iterator]() {
        return this
      },
    }
  }
}

function keysIterationMethod(this: any) {
  const wrap = val => (typeof val === 'object' ? reactive(val) : val)
  const isMap = target => Object.prototype.toString.call(target) === '[object Map]'
  const target = this[ReactiveFlags.RAW]
  const itr = target.keys()
  const targetIsMap = isMap(target)
  if (targetIsMap)
    track(target, MAP_KEY_ITERATE_KEY)
  else track(target, ITERATE_KEY)
  return {
    next() {
      const { value, done } = itr.next()
      return {
        value: wrap(value),
        done,
      }
    },
    [Symbol.iterator]() {
      return this
    },
  }
}
function valuesIterationMethod(this: any) {
  const wrap = val => (typeof val === 'object' ? reactive(val) : val)
  const target = this[ReactiveFlags.RAW]
  const itr = target.values()
  track(target, ITERATE_KEY)
  return {
    next() {
      const { value, done } = itr.next()
      return {
        value: wrap(value),
        done,
      }
    },
    [Symbol.iterator]() {
      return this
    },
  }
}
export const collectionHandlers = {
  get(target, key) {
    if (key === ReactiveFlags.RAW)
      return target
    if (key === 'size') {
      track(target, ITERATE_KEY)
      return Reflect.get(target, key, target)
    }
    return mutableInstrumentations[key]
  },
}
