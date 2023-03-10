import { hasOwn } from '@ming/shared'

const publicPropertiesMap = {
  $el: i => i.vnode.el,
  $emit: i => i.emit,
  $slots: i => i.slots,
  $props: i => i.props,
  $attrs: i => i.attrs,
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    if (key[0] !== '$') {
      // 先检测访问的 key 是否存在于 setupState 中, 是的话直接返回
      if (hasOwn(setupState, key)) {
        return setupState[key]
      }
      else if (hasOwn(props, key)) {
        // 看看 key 是不是在 props 中
        return props[key]
      }
    }

    const publicGetter = publicPropertiesMap[key]

    if (publicGetter)
      return publicGetter(instance)
  },

  set({ _: instance }, key, value) {
    const { setupState } = instance

    if (hasOwn(setupState, key)) {
      // setupState 赋值
      setupState[key] = value
    }

    return true
  },
}
