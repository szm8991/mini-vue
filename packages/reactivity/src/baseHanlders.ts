import { track, trigger } from './effect'
import { reactive, ReactiveFlags, reactiveMap } from './reactive'
const get = createGetter()
const set = createSetter()
const shallowReactiveGet = createGetter(true)
const readonlyReactiveGet = createGetter(false, true)
function createSetter() {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return res
  }
}
function createGetter(shallow: boolean = false, readonly: boolean = false) {
  return function get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !readonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return readonly
    }
    const res = Reflect.get(target, key, receiver)
    if (!readonly) {
      track(target, key)
    }
    // deep-lazy
    if (typeof res === 'object') {
      return shallow ? res : reactive(res)
    }
    return res
  }
}
export const mutableHandlers = {
  get,
  set,
}
export const shallowReactiveHandlers = {
  get: shallowReactiveGet,
  set,
}
export const readonlyHandlers = {
  get: readonlyReactiveGet,
  set,
}
