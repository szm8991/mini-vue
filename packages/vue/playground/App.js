import { h } from '../dist/index.mjs'
import { Prop } from './Prop.js'
window.self = null
export const App = {
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
    [h(Prop, { count: 1, title: 'attrs' })],
    // [
    //   h('div', {
    //     onClick() {
    //       console.log('div1')
    //     },
    //   }, 'div1'),
    // ],
    // `hello,${this.msg}`,
    // [
    //   h('div', { class: 'red' }, 'div1'),
    //   h('div', { class: 'blue' }, 'div2'),
    // ]
    )
  },
  setup() {
    return {
      msg: 'world',
    }
  },
}
