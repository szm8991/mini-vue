import { h, onMounted } from '../dist/index.mjs'
export const App = {
  name: 'app',
  render() {
    return h('h1', {}, 'hello world!')
  },
  setup() {
    onMounted(() => {
      console.log('mounted 1')
    })
    onMounted(() => {
      console.log('mounted 2')
    })
  },
}
