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
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        c1.forEach(c => unmount(c))
        hostSetElementText(container, c2 as string)
      }
      // old text patch new text
      else if (c2 !== c1) {
        hostSetElementText(container, c2 as string)
      }
    }
    else {
      // old text vs new not text
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent)
      }
      else {
        // old not text vs new not text
        patchKeyedChildren(c1, c2, container, anchor, parentComponent)
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
    // noDiff(c1, c2, container, parentAnchor, parentComponent)
    // edgeDiff(c1, c2, container, parentAnchor, parentComponent)
    quickDiff(c1, c2, container, parentAnchor, parentComponent)
  }
  // 暴力不diff
  function noDiff(
    c1: any[],
    c2: any[],
    container,
    parentAnchor,
    parentComponent) {
    c1.forEach(c => unmount(c))
    mountChildren(c2, container, parentComponent)
  }
  // 双端对比diff
  function edgeDiff(
    c1: any[],
    c2: any[],
    container,
    parentAnchor,
    parentComponent) {
    let oldStartIdx = 0
    let oldEndIdx = c1.length - 1
    let newStartIdx = 0
    let newEndIdx = c2.length - 1
    let oldStartVnode = c1[oldStartIdx]
    let oldEndVnode = c1[oldEndIdx]
    let newStartVnode = c2[newStartIdx]
    let newEndVnode = c2[newEndIdx]
    const isSameVNodeType = (n1, n2) => {
      return n1.type === n2.type && n1.key === n2.key
    }
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 为undefined说明已经处理过了
      if (!oldStartVnode) {
        oldStartVnode = c1[++oldStartIdx]
      }
      else if (!oldEndVnode) {
        oldEndVnode = c1[--oldEndIdx]
      }
      // 左-左对上了
      else if (isSameVNodeType(newStartVnode, oldStartVnode)) {
        patch(oldStartVnode, newStartVnode, container, parentAnchor, parentComponent)
        oldStartVnode = c1[++oldStartIdx]
        newStartVnode = c2[++newStartIdx]
      }
      // 右-右对上了
      else if (isSameVNodeType(newEndVnode, oldEndVnode)) {
        patch(oldEndVnode, newEndVnode, container, parentAnchor, parentComponent)
        oldEndVnode = c1[--oldEndIdx]
        newEndVnode = c2[--newEndIdx]
      }
      // 左-右对上了
      else if (isSameVNodeType(newStartIdx, oldEndIdx)) {
        patch(oldEndVnode, newStartVnode, container, parentAnchor, parentComponent)
        hostInsert(oldEndVnode.el, container, oldStartVnode.el)
        oldEndVnode = c1[--oldEndIdx]
        newStartVnode = c2[++newStartIdx]
      }
      // 右-左对上了
      else if (isSameVNodeType(newEndIdx, oldStartIdx)) {
        patch(oldStartVnode, newEndVnode, container, parentAnchor, parentComponent)
        hostInsert(oldStartVnode.el, container, oldEndVnode.el.nextSibling)
        oldStartVnode = c1[++oldStartIdx]
        newEndVnode = c2[--newEndIdx]
      }
      // 双端对不上的
      else {
        const idxInOld = c1.findIndex(node => isSameVNodeType(newStartVnode, node))
        // 找到了可复用的
        if (idxInOld > 0) {
          const vnodeToMove = c1[idxInOld]
          patch(vnodeToMove, newStartVnode, container, parentAnchor, parentComponent)
          hostInsert(vnodeToMove.el, container, oldStartVnode.el)
          c1[idxInOld] = undefined
        }
        // 没找到
        else {
          patch(null, newStartVnode, container, oldStartVnode.el, parentComponent)
        }
        newStartVnode = c2[++newStartIdx]
      }
    }
    // 边缘情况处理，多的删了，少的加上
    if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
      for (let i = newStartIdx; i <= newEndIdx; i++)
        patch(null, c2[i], container, oldStartVnode.el, parentComponent)
    }
    else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
      for (let i = oldStartIdx; i <= oldEndIdx; i++)
        unmount(c1[i])
    }
  }
  // 快速对比diff
  function quickDiff(
    c1: any[],
    c2: any[],
    container,
    parentAnchor,
    parentComponent) {
    // 指向新旧两组子节点的开头
    let j = 0
    let oldEnd = c1.length - 1
    let newEnd = c2.length - 1
    let oldVNode = c1[j]
    let newVNode = c2[j]
    const isSameVNodeType = (n1, n2) => {
      return n1.type === n2.type && n1.key === n2.key
    }
    // 先从头找直到不一样——左左对比
    while (j <= oldEnd && j <= newEnd) {
      if (!isSameVNodeType(newVNode, oldVNode))
        break
      patch(oldVNode, newVNode, container, parentAnchor, parentComponent)
      j++
      oldVNode = c1[j]
      newVNode = c2[j]
    }
    oldVNode = c1[oldEnd]
    newVNode = c2[newEnd]
    // 再从后找直到不一样——右右对比
    while (j <= oldEnd && j <= newEnd) {
      if (!isSameVNodeType(newVNode, oldVNode))
        break
      patch(oldVNode, newVNode, container, parentAnchor, parentComponent)
      oldEnd--
      newEnd--
      oldVNode = c1[oldEnd]
      newVNode = c2[newEnd]
    }
    // 旧的遍历完了，新的还有，j到newEnd的应该作为新节点插入
    if (j > oldEnd && j <= newEnd) {
      const anchorIndex = newEnd + 1
      const anchor = anchorIndex < c2.length ? c2[anchorIndex].el : parentAnchor
      while (j <= newEnd)
        patch(null, c2[j++], container, anchor, parentComponent)
    }
    // 新的遍历完了，老的还有，j到oldEnd的应该卸载
    else if (j > newEnd && j <= oldEnd) {
      while (j <= oldEnd)
        unmount(c1[j++])
    }
    // 需要移动
    else {
      const count = newEnd - j + 1
      const sources = new Array(count).fill(-1)
      const oldStart = j
      const newStart = j
      // 双循环，性能差，建议打表
      // for (let i = oldStart; i <= oldEnd; i++) {
      //   oldVNode = c1[i]
      //   for (let k = newStart; k <= newEnd; k++) {
      //     newVNode = c2[k]
      //     if (isSameVNodeType(newVNode, oldVNode)) {
      //       patch(oldVNode, newVNode, container, parentAnchor, parentComponent)
      //       source[k - newStart] = i
      //     }
      //   }
      // }
      // 找能复用的，先patch，后移动
      const keyIndex: any[] = []
      let moved = false
      let pos = 0
      for (let i = newStart; i <= newEnd; i++)
        keyIndex[c2[i].key] = i
      let patched = 0
      for (let i = oldStart; i <= oldEnd; i++) {
        oldVNode = c1[i]
        if (patched <= count) {
          const k = keyIndex[oldVNode.key]
          if (typeof k !== 'undefined') {
            newVNode = c2[k]
            patch(oldVNode, newVNode, container, parentAnchor, parentComponent)
            patched++
            sources[k - newStart] = i
            if (k < pos) {
              // 需要移动
              moved = true
            }
            else {
              pos = k
            }
          }
          else {
            unmount(oldVNode)
          }
        }
        else {
          unmount(oldVNode)
        }
      }
      // 需要移动
      if (moved) {
        const seq = getLIS(sources)
        // 最长key递增子序列最后一个元素
        let s = seq.length - 1
        // 新子节点数组第最后一个元素
        let i = count - 1
        for (i; i >= 0; i--) {
          if (sources[i] === -1) {
            // 是新节点，要挂载
            const pos = i + newStart
            newVNode = c2[pos]
            const anchor = pos + 1 < c2.length ? c2[pos + 1].el : null
            patch(null, newVNode, container, anchor, parentComponent)
          }
          else if (i !== seq[s]) {
            // i位置的新子节点需要移动
            const pos = i + newStart
            newVNode = c2[pos]
            const anchor = pos + 1 < c2.length ? c2[pos + 1].el : null
            hostInsert(newVNode.el, container, anchor)
          }
          else {
            // i位置的新子节点不需要移动
            s--
          }
        }
      }
    }
  }
  function getLIS(arr: number[]): number[] {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        j = result[result.length - 1]
        if (arr[j] < arrI) {
          p[i] = j
          result.push(i)
          continue
        }
        u = 0
        v = result.length - 1
        while (u < v) {
          c = (u + v) >> 1
          if (arr[result[c]] < arrI)
            u = c + 1
          else
            v = c
        }
        if (arrI < arr[result[u]]) {
          if (u > 0)
            p[i] = result[u - 1]
          result[u] = i
        }
      }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
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
      patchChildren(n1, n2, container, null, parentComponent)
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
      scheduler() {
        queueJob(instance.update)
      },
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
