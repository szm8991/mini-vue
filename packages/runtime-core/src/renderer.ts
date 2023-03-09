import { ShapeFlags, isArray, isString } from '@ming/shared'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'
export function createRenderer(options: any) {
  const {
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    clear: hostClear,
  } = options
  // 平台相关的渲染逻辑，如何将vnode转化为真实node
  function render(vnode, container) {
    if (vnode)
      patch(container._vnode, vnode, container)
    else
      container._vnode && hostClear(container)
    container._vnode = vnode
  }
  function patch(n1, n2, container = null, anchor = null, parentComponent = null) {
    // n1-旧的vnode，n2-新的vnode
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      case Fragment:
        processFragment(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT)
          processElement(n1, n2, container, anchor, parentComponent)
        else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT)
          processComponent(n1, n2, container, parentComponent)
    }
  }
  function processElement(n1, n2, container, anchor, parentComponent) {
    if (!n1) {
      mountElement(n2, container, anchor)
    }
    else {
      // todo
    }
  }
  function mountElement(vnode, container, anchor) {
    const { shapeFlag, props } = vnode
    const el = (vnode.el = hostCreateElement(vnode.type))
    // if (shapeFlag & ShapeFlags.TEXT_CHILDREN)
    if (isString(vnode.children))
      hostSetElementText(el, vnode.children)
    else if (isArray((vnode.children)))
    // else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN)
      mountChildren(vnode.children, el)
    if (props) {
      for (const key in props)
        hostPatchProp(el, key, null, props[key])
    }
    hostInsert(el, container, anchor)
  }
  function mountChildren(children, container) {
    children.forEach((child) => {
      patch(null, child, container)
    })
  }
  function processComponent(n1, n2, container, parentComponent) {
    if (!n1)
      mountComponent(n2, container, parentComponent)
    else
      updateComponent(n1, n2, container)
  }
  function updateComponent(n1, n2, container) {

  }
  function mountComponent(vnode, container, parentComponent) {
    const instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent,
    ))
    setupComponent(instance)

    setupRenderEffect(instance, vnode, container)
  }
  function processText(n1, n2, container) {

  }

  function processFragment(n1, n2, container) {

  }
  function setupRenderEffect(instance: any, vnode: any, container: any) {
    const subTree = instance.render(instance.setupState || {})
    patch(null, subTree, container)
  }
  return { render, createApp: createAppAPI(render) }
}
