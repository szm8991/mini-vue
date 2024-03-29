import { getCurrentInstance } from './component'

export function provide(key, value) {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent?.provides
    // 利用原型链来获取最近的Provide
    if (parentProvides === provides)
      provides = currentInstance.provides = Object.create(parentProvides)
    provides[key] = value
  }
}

export function inject(key, defaultValue) {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    const provides = currentInstance.parent?.provides
    if (provides) {
      if (key in provides) {
        return provides[key]
      }
      else if (defaultValue) {
        if (typeof defaultValue === 'function')
          return defaultValue()
        return defaultValue
      }
    }
  }
  return undefined
}
