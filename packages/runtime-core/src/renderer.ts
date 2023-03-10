import { effect } from '@ming/reactive'
import { ShapeFlags } from '@ming/shared'
import { createComponentInstance, setupComponent } from './component'
import { shouldUpdateComponent } from './componentRenderUtils'
import { createAppAPI } from './createApp'
import { queueJob } from './scheduler'
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
      patch(container._vnode, vnode, container, null, null)
    else
      container._vnode && unmount(container._vnode)
    container._vnode = vnode
  }
  function unmount(vnode) {
    const parent = vnode.el.parentNode
    if (parent)
      parent.removeChild(vnode.el)
    else hostClear(vnode.el)
  }
  function patch(n1, n2, container = null, anchor = null, parentComponent = null) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    // n1-旧的vnode，n2-新的vnode
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT)
          processElement(n1, n2, container, anchor, parentComponent)
        else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT)
          processComponent(n1, n2, container, parentComponent)
    }
  }
  function processElement(n1, n2, container, anchor, parentComponent) {
    if (!n1)
      mountElement(n2, container, anchor, parentComponent)
    else
      updateElement(n1, n2, container, anchor, parentComponent)
  }
  function mountElement(vnode, container, anchor, parentComponent) {
    const { shapeFlag, props } = vnode
    const el = (vnode.el = hostCreateElement(vnode.type))
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN)
    // if (isString(vnode.children))
      hostSetElementText(el, vnode.children)
    // else if (isArray((vnode.children)))
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN)
      mountChildren(vnode.children, el, parentComponent)
    if (props) {
      for (const key in props)
        hostPatchProp(el, key, null, props[key])
    }
    hostInsert(el, container, anchor)
  }
  function updateElement(n1: any, n2: any, container: any, anchor: any, parentComponent: any) {
    const el = (n2.el = n1.el)
    const oldProps = (n1 && n1.props) || {}
    const newProps = n2.props || {}
    patchProps(el, oldProps, newProps)
    patchChildren(n1, n2, el, anchor, parentComponent)
  }
  function patchProps(el, oldProps, newProps) {
    // prop changed
    for (const key in newProps) {
      const prevProp = oldProps[key]
      const nextProp = newProps[key]
      if (prevProp !== nextProp)
        hostPatchProp(el, key, prevProp, nextProp)
    }
    // prop deleted
    for (const key in oldProps) {
      const prevProp = oldProps[key]
      if (!(key in newProps))
        hostPatchProp(el, key, prevProp, null)
    }
  }
  function patchChildren(n1, n2, container, anchor, parentComponent) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1
    const { shapeFlag, children: c2 } = n2
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // old array patch new text
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN)
        c1.forEach(c => unmount(c))
      // old text patch new text
      else if (c2 !== c1)
        hostSetElementText(container, c2 as string)
    }
    else {
      // old text vs new not text
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent)
      }
      else {
        // old not text vs new not text
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }
  function patchKeyedChildren(
    c1: any[],
    c2: any[],
    container,
    parentAnchor,
    parentComponent,
  ) {
    // todo diff
  }
  function mountChildren(children, container, parentComponent) {
    children.forEach((child) => {
      patch(null, child, container, null, parentComponent)
    })
  }
  function processComponent(n1, n2, container, parentComponent) {
    if (!n1)
      mountComponent(n2, container, parentComponent)
    else
      updateComponent(n1, n2, container)
  }
  function updateComponent(n1, n2, container) {
    const instance = (n2.component = n1.component)
    // 先看看这个组件是否应该更新
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    }
    else {
      n2.component = n1.component
      n2.el = n1.el
      instance.vnode = n2
    }
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
    if (!n1) {
      hostInsert((n2.el = hostCreateText(n2.children as string)), container)
    }
    else {
      // todo
    }
  }

  // 只需要渲染 children
  function processFragment(n1, n2, container, parentComponent) {
    if (!n1)
      mountChildren(n2.children, container, parentComponent)
    else
      patchChildren(n1.children, n2.children, container, null, parentComponent)
  }
  function setupRenderEffect(instance: any, vnode: any, container: any) {
    instance.update = effect(() => {
      if (!instance.isMounted) {
        const subTree = instance.subTree = instance.render.call(instance.proxy, instance.proxy) // instance.render(instance.setupState || {})
        patch(null, subTree, container, null, instance)
        instance.mounted && instance.mounted.forEach(hook => hook.call(instance.proxy, instance.proxy))
        // 把 root element 赋值给 组件的vnode.el ，为后续调用 $el 的时候获取值
        vnode.el = subTree.el
        instance.isMounted = true
      }
      else {
        console.log('update')
        const { next, vnode } = instance

        // 如果有 next 的话， 说明需要更新组件的数据（props，slots 等）
        // 先更新组件的数据，然后更新完成后，在继续对比当前组件的子元素
        if (next) {
          // 问题是 next 和 vnode 的区别是什么
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        }
        const newTree = instance.render.call(instance.proxy)
        const oldTree = instance.subTree
        instance.subTree = newTree
        patch(oldTree, newTree, oldTree.el, null, instance)
      }
    }, {
      scheduler: queueJob,
    })
  }
  function updateComponentPreRender(instance, nextVNode) {
    nextVNode.component = instance
    instance.vnode = nextVNode
    instance.next = null
    const { props } = nextVNode
    instance.props = props
  }
  return { render, createApp: createAppAPI(render) }
}
