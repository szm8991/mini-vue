import { h } from '../dist/index.mjs'
window.self = null
export const App = {
  render(state) {
    window.self = this
    return h('h1', { id: 'root', class: ['foo', 'bar'] },
    `hello,${this.msg}`,
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
