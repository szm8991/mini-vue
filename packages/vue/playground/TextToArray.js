import { h, ref } from '../dist/index.mjs'
const prevChildren = 'next children'
const nextChildren = [h('div', {}, 'A'), h('div', {}, 'B')]
export const TextToArray = {
  name: 'TextToArray',
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
