import { h, ref } from '../dist/index.mjs'
const nextChildren = [h('div', { key: 3 }, 'A3'), h('div', { key: 1 }, 'A1'), h('div', { key: 4 }, 'A4'), h('div', { key: 2 }, 'A2')]
const prevChildren = [h('div', { key: 1 }, 'A1'), h('div', { key: 2 }, 'A2'), h('div', { key: 3 }, 'A3')]
export const ArrayToArray = {
  name: 'ArrayToArray',
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
