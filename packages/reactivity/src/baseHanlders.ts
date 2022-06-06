import { track, trigger } from './effect';
import { reactive, ReactiveFlags, reactiveMap } from './reactive';
const get = createGetter();
const set = createSetter();
const shallowReactiveGet = createGetter(true);
function createSetter() {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver);
    trigger(target, key);
    return res;
  };
}
function createGetter(shallow: boolean = false) {
  return function get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    const res = Reflect.get(target, key, receiver);
    track(target, key);
    // deep-lazy
    if (typeof res === 'object') {
      return shallow ? res : reactive(res);
    }
    return res;
  };
}
export const mutableHandlers = {
  get,
  set,
};
export const shallowReactiveHandlers = {
  get: shallowReactiveGet,
  set,
};
