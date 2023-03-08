import type { effectFnType } from './effect'
import { trackOpBit } from './effect'
export type Dep = Set<effectFnType> & TrackedMarkers
// 记录当前副作用以前是不是track的
interface TrackedMarkers {
  w: number // wasOldTracked
  n: number // wasNewTracked
}
export const createDep = (): Dep => {
  const dep = new Set<effectFnType>() as Dep
  dep.w = 0
  dep.n = 0
  return dep
}
export const wasTracked = (dep: Dep): boolean => (dep.w & trackOpBit) > 0
export const newTracked = (dep: Dep): boolean => (dep.n & trackOpBit) > 0
export const initDepMarkers = ({ deps }: effectFnType) => {
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      // |= 标记已经track
      deps[i].w |= trackOpBit
    }
  }
}
// 完成依赖标记
export const finalizeDepMarkers = (effect: effectFnType) => {
  const { deps } = effect
  if (deps.length) {
    let ptr = 0
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i]
      // 之前的依赖现在没了
      if (wasTracked(dep) && !newTracked(dep))
        dep.delete(effect)
      else
        deps[ptr++] = dep

      // 清理二进制标记
      dep.w &= ~trackOpBit
      dep.n &= ~trackOpBit
    }
    deps.length = ptr
  }
}
