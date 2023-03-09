import { h } from '../dist/index.mjs'
export const Slot = {
  props: {
  },
  render() {
    return h('div', {}, [this.$slots.header(), this.$slots.body(), this.$slots.footer()])
  },
  setup() {
    return {
    }
  },
}
