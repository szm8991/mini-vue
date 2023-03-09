import { h } from '../dist/index.mjs'
import { Prop } from './Prop.js'
window.self = null
export const App = {
  name: 'app',
  render(state) {
    window.self = this
    return h('h1', {
      id: 'root',
      class: ['foo', 'bar'],
    },
    [h(Prop, { count: 1, title: 'attrs' })],
    )
  },
  setup() {
    return {
      msg: 'world',
    }
  },
}
