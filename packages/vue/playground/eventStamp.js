import { effect, h, ref } from '../dist/index.mjs'
const bol = ref(false)
export const App = {
  render(state) {
    let vnode
    effect(() => {
      vnode = h('h1', {
        id: 'root',
        class: ['foo', 'bar'],
        onClick: bol.value
          ? [
              () => console.log('click1'),
              () => console.log('click2'),
            ]
          : {},
      },
      [
        h('div', {
          onClick() {
            bol.value = true
          },
        }, 'div1'),
      ])
    })
    return vnode
  },
  setup() {
    return {
      msg: 'world',
    }
  },
}
