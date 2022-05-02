let activeEffect;
let bucket = new WeakMap();
const effectStack: any[] = [];
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    // Set.delete
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}
export function effect(fn, options: any = {}) {
  const effectFn = () => {
    // 清除副作用
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.deps = [];
  effectFn.options = options;
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}
export function track(target, key) {
  // objs(WeaKMap)->keys(Map)->effectFn(Set)
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}
export function trigger(target, key) {
  let depsMap = bucket.get(target);
  if (!depsMap) return;
  let deps = depsMap.get(key);
  let effectToRun = new Set();
  deps &&
    deps.forEach(effectFn => {
      if (effectFn !== activeEffect) effectToRun.add(effectFn);
    });
  effectToRun.forEach((effectFn: any) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}
