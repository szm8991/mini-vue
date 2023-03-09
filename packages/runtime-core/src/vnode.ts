import { ShapeFlags } from '@ming/shared'

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

  return vnode
}
