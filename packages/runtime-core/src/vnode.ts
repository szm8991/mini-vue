import { ShapeFlags, isArray, isObject, isString } from '@ming/shared'

function getShapeFlag(type: any) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')
export const createVNode = function (
  type: any,
  props?: any,
  children?: string | Array<any>,
) {
  // todo
  // props.class=normalizeClass(props.class)
  const vnode = {
    el: null,
    component: null,
    key: props?.key,
    type,
    props: props || {},
    children,
    shapeFlag: getShapeFlag(type),
  }
  // 基于 children 再次设置 shapeFlag
  if (isArray(children))
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN

  else if (isString(children))
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN

  normalizeSlotChildren(vnode, children)
  return vnode
}
export function normalizeSlotChildren(vnode, children) {
  if (isObject(children)) {
    if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
      // todo
    }
    else {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    }
  }
}

export function createTextVNode(text = ' ') {
  return createVNode(Text, {}, text)
}
