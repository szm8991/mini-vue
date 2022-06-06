import { mutableHandlers, shallowReactiveHandlers } from './baseHanlders';
export const reactiveMap = new WeakMap();
export const shallowReactiveMap = new WeakMap();
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
}
export function reactive(target: Object) {
  return createReactiveObject(target, reactiveMap, mutableHandlers);
}
export function shallowReactive(target: object) {
  return createReactiveObject(target, shallowReactiveMap, shallowReactiveHandlers);
}
export function readonly(target) {}
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
function createReactiveObject(target, proxyMap, baseHandlers) {
  const existingProxy = proxyMap.get(target);
  if (existingProxy) return existingProxy;
  const proxy = new Proxy(target, baseHandlers);
  // 缓存多次代理相同对象
  proxyMap.set(target, proxy);
  return proxy;
}
