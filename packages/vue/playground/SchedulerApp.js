import { Fragment, getCurrentInstance, h, nextTick, ref } from '../dist/index.mjs'
export const App = {
  name: 'app',
  render() {
    return h(Fragment, { }, [
      h('button', { onClick: this.onClick }, 'update'),
      h('p', { }, `count:${this.count}`),
    ])
  },
  setup() {
    const count = ref(1)
    const instance = getCurrentInstance()
    const onClick = () => {
      for (let i = 0; i < 100; i++)
        count.value = i
      console.log(instance.vnode.component.subTree.children[1].el.textContent)
      nextTick(() => {
        console.log(instance.vnode.component.subTree.children[1].el.textContent)
      })
    }

    return {
      count,
      onClick,
    }
  },
}
