export const enum ShapeFlags {
  // 最后要渲染的 element 类型
  ELEMENT = 1,
  // 函数组件
  FUNCTIONAL_COMPONENT = 1 << 1,
  // 状态组件
  STATEFUL_COMPONENT = 1 << 2,
  // vnode 的 children 为 string 类型
  TEXT_CHILDREN = 1 << 3,
  // vnode 的 children 为数组类型
  ARRAY_CHILDREN = 1 << 4,
  // vnode 的 children 为 slots 类型
  SLOTS_CHILDREN = 1 << 5,
  // 组件包含函数组件和状态组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}
