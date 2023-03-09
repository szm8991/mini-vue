import { Fragment, h } from '../dist/index.mjs'
export const Slot = {
  props: {
  },
  render() {
    return h(Fragment, {}, [this.$slots.header({ age: 1 }), this.$slots.body({ age: 2 }), this.$slots.footer({ age: 3 })])
  },
  setup() {
    return {
    }
  },
}
