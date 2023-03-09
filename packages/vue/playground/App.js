import { Fragment, h, ref } from '../dist/index.mjs'
export const App = {
  name: 'app',
  render() {
    return h(Fragment, {},
      [
        h('div', {}, `count:${this.count}`),
        h('button', { onClick: this.onClick }, 'count plus'),
      ])
  },
  setup() {
    const count = ref(0)
    const onClick = () => {
      count.value++
      console.log(count.value)
    }
    return {
      count,
      onClick,
    }
  },
}
