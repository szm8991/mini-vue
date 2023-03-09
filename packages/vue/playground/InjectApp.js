import { Fragment, h, inject, provide } from '../dist/index.mjs'
const PI = {
  name: 'Foo',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz', () => 'baz')
    const mm = inject('mm', 'mm')
    return {
      foo,
      bar,
      baz,
      mm,
    }
  },
  render() {
    return h('div', {}, `foo:${this.foo},bar:${this.bar},bar:${this.baz},mm:${this.mm}`)
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
