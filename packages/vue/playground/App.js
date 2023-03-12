import { ref } from '../dist/index.mjs'
export const App = {
  name: 'app',
  template: '<div>countVal: {{count}}</div>',
  setup() {
    const count = globalThis.count = ref(1)
    return {
      count,
    }
  },
}
