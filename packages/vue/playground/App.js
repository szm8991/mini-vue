import { h } from '../dist/index.mjs'
export const App = {
  render(state) {
    return h('h1', {}, `hello,${state.msg}!`)
  },
  setup() {
    return {
      msg: 'world',
    }
  },
}
