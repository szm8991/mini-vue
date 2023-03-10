import { h, ref } from '../dist/index.mjs'
import { Update } from './Update.js'
export const App = {
  name: 'app',
  render() {
    return h(Update, { foo: this.foo, onChangeProp: this.changeProp })
  },
  setup() {
    const foo = ref('foo')
    const changeProp = () => {
      console.log('changeProp')
      foo.value = 'another foo'
    }
    return {
      foo,
      changeProp,
    }
  },
}
