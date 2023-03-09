import { createRenderer } from '@ming/runtime-core'
import { normalizeClass, shouldSetAsProps } from '@ming/shared'
// element节点
function createElement(tag) {
  return document.createElement(tag)
}
function setElementText(el, text) {
  el.textContent = text
}
function insert(el, parent, anchor = null) {
  parent.insertBefore(el, anchor)
}
function clear(el) {
  el.innerHTML = ''
}
// 文本和注释节点
function createText(text) {
  return document.createTextNode(text)
}
function setText(el, text) {
  el.nodeValue = text
}

function remove(el) {
  const parent = el.parentNode
  if (parent)
    parent.removeChild(el)
}

function patchProp(el, key, preValue, nextValue) {
  if (/^on[A-Z]/.test(key)) {
    // 通过额外属性存储事件函数，不需要addEventListener和removeEventListener了
    const invokers = el._vei || (el._vei = {})
    const invoker = invokers[key]
    const eventName = key.slice(2).toLowerCase()
    if (nextValue && invoker) {
      invoker.value = nextValue
    }
    else {
      if (nextValue) {
        const invoker = (invokers[key] = nextValue)
        el.addEventListener(eventName, invoker)
      }
      else {
        el.removeEventListener(eventName, invoker)
        invokers[key] = undefined
      }
    }
  }
  else if (key === 'class') {
    // className设置方式的性能最优
    el.className = normalizeClass(nextValue) || ''
  }
  else if (shouldSetAsProps(el, key, nextValue)) {
    // setAttribute方式设置布尔值会将布尔值变为字符串在设置，需要特殊处理
    const type = typeof el[key]
    if (type === 'boolean' && nextValue === '')
      el[key] = true
    else el[key] = nextValue
  }
  else {
    if (nextValue === null || nextValue === '')
      el.removeAttribute(key)
    else
      el.setAttribute(key, nextValue)
  }
}

let renderer

function ensureRenderer() {
  return (
    renderer
    || (renderer = createRenderer({
      createElement,
      createText,
      setText,
      setElementText,
      patchProp,
      insert,
      remove,
      clear,
    }))
  )
}

export const createApp = (...args) => {
  return ensureRenderer().createApp(...args)
}

export * from '@ming/runtime-core'
