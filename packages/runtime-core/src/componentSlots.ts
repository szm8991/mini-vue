import { ShapeFlags } from '@ming/shared'
const normalizeObjectSlots = (rawSlots, slots) => {
  for (const key in rawSlots) {
    const value = rawSlots[key]
    if (typeof value === 'function') {
      // 默认 slots 返回的就是一个 vnode 对象
      slots[key] = props => value(props)
    }
  }
}
export function initSlots(instance) {
  const { vnode } = instance
  const { children } = vnode
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN)
    normalizeObjectSlots(children, (instance.slots = {}))
}
