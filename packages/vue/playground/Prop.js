import { h } from '../dist/index.mjs'
export const Prop = {
  props: {
    count: Number,
  },
  render(state) {
    return h('h1', {}, `foo:${this.count}`)
  },
  setup(props) {
    console.log(props)
    return {
      msg: 'world',
    }
  },
}
