import { h, ref } from '../dist/index.mjs'
export const App = {
  name: 'app',
  props: {
    foo: String,
  },
  render() {
    return h('div', { foo: this.foo }, [
      h('div', {}, `foo:${this.foo}`),
      h('button', { onClick: this.changeProp }, 'prop change'),
    ])
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
