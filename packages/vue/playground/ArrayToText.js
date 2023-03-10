import { h, ref } from '../dist/index.mjs'
const nextChildren = 'next children'
const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')]
export const ArrayToText = {
  name: 'ArrayToText',
  render() {
    const self = this
    return self.isChange === true
      ? h('div', {}, nextChildren)
      : h('div', {}, prevChildren)
  },
  setup() {
    const isChange = ref(false)
    window.isChange = isChange
    return {
      isChange,
    }
  },
}
