import { Fragment, h, inject, provide } from '../dist/index.mjs'
const PI = {
  name: 'Foo',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    return {
      foo,
      bar,
    }
  },
  render() {
    return h('div', {}, `foo:${this.foo},bar:${this.bar}`)
  },
}
const PI0 = {
  name: 'Bar',
  setup() {
  },
  render() {
    return h(Fragment, {}, [h('div', {}, 'bar'), h(PI, {})])
  },
}
export const App = {
  name: 'app',
  render() {
    return h(Fragment, {}, [h(PI0, {})])
  },
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
}
