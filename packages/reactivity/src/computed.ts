import { effect, track, trigger } from './effect'
export type ComputedGetter<T> = (...args: any[]) => T
export function computed<T>(getter: ComputedGetter<T>) {
  let value
  let dirty = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      trigger(obj, 'value')
    },
  })
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    },
  }
  return obj
}
