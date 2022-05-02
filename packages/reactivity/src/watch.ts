import { effect } from './effect';
export function watch(source, cb) {
  let getter;
  if (typeof source === 'function') getter = source;
  else getter = () => traverse(source);
  let oldValue, newValue;
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler() {
      newValue = effectFn();
      cb(oldValue, newValue);
      oldValue = newValue;
    },
  });
  oldValue = effectFn();
}
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value !== null || seen.has(value)) return;
  seen.add(value);
  for (const k of value) {
    traverse(value[k], seen);
  }
  return value;
}
