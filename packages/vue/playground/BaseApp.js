import { h } from '../dist/index.mjs'
window.self = null
export const App = {
  name: 'app',
  render(state) {
    window.self = this
    return h('h1', {
      id: 'root',
      class: ['foo', 'bar'],
      onClick: [
        () => console.log('click1'),
        () => console.log('click2'),
      ]
      ,
    },
    [
      h('div', { class: 'red' }, 'div1'),
      h('div', { class: 'blue' }, 'div2'),
    ],
    )
  },
  setup() {
    return {
      msg: 'world',
    }
  },
}
