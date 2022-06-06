import { initDepMarkers, finalizeDepMarkers, createDep, newTracked, wasTracked } from './dep';
let activeEffect: effectFnType | undefined;
let shouldTrack = true;
export function stopTrack() {
  shouldTrack = false;
}
export function startTrack() {
  shouldTrack = true;
}
let bucket = new WeakMap();
// 用于存储嵌套的effect
const effectStack: any[] = [];
export type effectFnType = ReturnType<typeof effect>;
// effect的嵌套深度
let effectTrackDepth = 0;
// 标识依赖收集的状态 二进制标记
export let trackOpBit = 1;
// 最大标记的位数，超过这个js，恢复全部clean的逻辑 数字太大可能溢出
const maxMarkerBits = 30;
function cleanup(effectFn: effectFnType) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    effectFn.deps[i].delete(effectFn);
  }
  effectFn.deps.length = 0;
}
interface EffectOption {
  lazy?: boolean;
  immediate?: boolean;
  scheduler?: (...args: any[]) => void;
}
export function effect<T>(fn: () => T, options: EffectOption = {}) {
  const effectFn = () => {
    let res;
    try {
      // 清除副作用，实现分支切换
      // cleanup(effectFn);
      activeEffect = effectFn;
      shouldTrack = true;
      effectStack.push(effectFn);
      // vue3.2中的cleanup流程
      // 当前effect的二进制位置
      trackOpBit = 1 << ++effectTrackDepth;
      if (effectTrackDepth <= maxMarkerBits) {
        // 给以前的依赖打标记——w
        initDepMarkers(effectFn);
      } else {
        cleanup(effectFn);
      }
      // fn执行时会走到track
      res = fn();
    } finally {
      if (effectTrackDepth <= maxMarkerBits) {
        // 根据w和n的标识，完成依赖清理&分支切换
        finalizeDepMarkers(effectFn);
      }
      trackOpBit = 1 << --effectTrackDepth;
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
    return res;
  };
  effectFn.deps = [];
  effectFn.options = options;
  if (!options.lazy) {
    effectFn();
  }
  effectFn.stop = function () {
    const { deps } = effectFn;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effectFn);
      }
      deps.length = 0;
    }
  };
  return effectFn;
}
export function track(target, key) {
  if (!activeEffect || !shouldTrack) return;
  // objs(WeaKMap)->keys(Map)->effectFn(Set)
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = createDep();
  }
  depsMap.set(key, deps);
  // 标记依赖
  trackEffects(deps);
}
function trackEffects(deps) {
  let shouldTrack = false;
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(deps)) {
      // 给现在的依赖打标记——n
      deps.n |= trackOpBit;
      // 如果依赖已经被收集，则不需要再次收集
      shouldTrack = !wasTracked(deps);
    }
  } else {
    // 当前依赖在现在这轮依赖收集中已经收集过了
    shouldTrack = !deps.has(activeEffect);
  }
  if (shouldTrack && activeEffect && !deps.has(activeEffect)) {
    // 防止重复注册
    // 收集依赖
    deps.add(activeEffect);
    activeEffect!.deps.push(deps);
  }
}
export function trigger(target, key) {
  let depsMap = bucket.get(target);
  if (!depsMap) return;
  let deps = depsMap.get(key);
  let effectToRun = new Set<effectFnType>();
  deps &&
    deps.forEach(effectFn => {
      // 避免无限递归
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
