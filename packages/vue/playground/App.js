import { h } from '../dist/index.mjs'
import { Emit } from './Emit.js'
export const App = {
  name: 'app',
  render() {
    return h('h1', {}, [h(Emit, {
      onAdd(a, b) {
        console.log('on emit add', a, b)
      },
    })])
  },
  setup() {
  },
}
