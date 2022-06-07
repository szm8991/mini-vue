import { mutableHandlers, shallowReactiveHandlers, readonlyHandlers } from './baseHanlders'
export const reactiveMap = new WeakMap()
export const shallowReactiveMap = new WeakMap()
export const readonlyMap = new WeakMap()
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
}
export function reactive(target: Object) {
  return createReactiveObject(target, reactiveMap, mutableHandlers)
}
export function shallowReactive(target: object) {
  return createReactiveObject(target, shallowReactiveMap, shallowReactiveHandlers)
}
export function readonly(target: object) {
  return createReactiveObject(target, readonlyMap, readonlyHandlers)
}
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}
export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}
function createReactiveObject(target, proxyMap, baseHandlers) {
  const existingProxy = proxyMap.get(target)
  if (existingProxy) return existingProxy
  const proxy = new Proxy(target, baseHandlers)
  // 缓存多次代理相同对象
  proxyMap.set(target, proxy)
  return proxy
}
