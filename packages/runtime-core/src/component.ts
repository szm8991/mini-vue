import { proxyRefs, shallowReadonly } from '@ming/reactive'
import { emit } from './componentEmits'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'
let currentInstance: any = null
// 这个接口暴露给用户，用户可以在 setup 中获取组件实例 instance
export function getCurrentInstance(): any {
  return currentInstance
}

export function setCurrentInstance(instance) {
  currentInstance = instance
}
export function onMounted(fn) {
  if (currentInstance)
    currentInstance.mounted.push(fn)
  else
    console.warn('onMounted only called in setup')
}
export function createComponentInstance(vnode, parent) {
  const instance = {
    type: vnode.type,
    vnode,
    next: null, // 需要更新的 vnode，用于更新 component 类型的组件
    props: {},
    parent,
    provides: parent ? parent.provides : {}, //  获取 parent 的 provides 作为当前组件的初始化值 这样就可以继承 parent.provides 的属性了
    proxy: null,
    isMounted: false,
    attrs: {}, // 存放 attrs 的数据
    slots: {}, // 存放插槽的数据
    ctx: {}, // context 对象
    setupState: {}, // 存储 setup 的返回值
    emit: () => {},
    mounted: [], // 存储mounted生命周期函数
  }

  // 在 prod 坏境下的 ctx 只是下面简单的结构
  // 在 dev 环境下会更复杂
  instance.ctx = {
    _: instance,
  }

  instance.emit = emit.bind(null, instance) as any
  return instance
}

export function setupComponent(instance) {
  initProps(instance)
  initSlots(instance)
  setupStatefulComponent(instance)
}
function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: instance.emit,
  }
}
function setupStatefulComponent(instance) {
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
  const Component = instance.type
  const { setup } = Component
  if (setup) {
    setCurrentInstance(instance)
    const setupContext = createSetupContext(instance)
    const setupResult = setup(shallowReadonly(instance.props), setupContext)
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
  else {
    // TODO
  }
}
function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === 'function') {
    // setup返回render函数
    instance.render = setupResult
  }
  else if (typeof setupResult === 'object') {
    // setup返回state
    instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}
let compiler
export function registerRuntimeCompiler(_compiler) {
  compiler = _compiler
}
function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (!instance.render) {
    if (compiler && !Component.render) {
      if (Component.template) {
        // 这里就是 runtime 模块和 compile 模块结合点
        const template = Component.template
        Component.render = compiler(template)
      }
    }
    instance.render = Component.render
  }
}
