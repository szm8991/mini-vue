import { h } from '../dist/index.mjs'
export const App = {
  render() {
    return h('h1', {}, `hello,${this.msg}!`)
  },
  setup() {
    return {
      msg: 'world',
    }
  },
}
