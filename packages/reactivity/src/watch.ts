import { effect } from './effect'
interface watchOptions {
  deep?: boolean
  immediate?: boolean
  flush?: 'post' | 'sync' | 'pre'
}
export function watch(source, cb, options: watchOptions = {}) {
  let getter
  if (typeof source === 'function')
    getter = source
  else getter = () => traverse(source)
  let oldValue, newValue
  // 存储过期回调
  let cleanup
  function onInvalidate(fn) {
    cleanup = fn
  }
  const job = () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    newValue = effectFn()
    if (cleanup)
      cleanup()
    cb(newValue, oldValue, onInvalidate)
    oldValue = newValue
  }

  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler() {
      if (options.flush === 'post') {
        // 异步队列执行
        const p = Promise.resolve()
        p.then(job)
      }
      else {
        job()
      }
    },
  })
  if (options.immediate)
    job()
  else oldValue = effectFn()
}
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value))
    return
  seen.add(value)
  for (const k in value)
    traverse(value[k], seen)

  return value
}
