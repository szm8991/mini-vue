import { h } from '../dist/index.mjs'
export const Prop = {
  props: {
    count: Number,
  },
  render(state) {
    return h('h1', {}, `foo:${this.count} ${this.$attrs.title}`)
  },
  setup(props) {
    console.log(props.count)
    props.count++
    console.log(props.count)
    return {
      msg: 'world',
    }
  },
}
