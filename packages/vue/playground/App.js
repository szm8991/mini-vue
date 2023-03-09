import { h } from '../dist/index.mjs'
import { Slot } from './Slot.js'
export const App = {
  name: 'app',
  render() {
    return h('div', {}, [h(Slot, {},
      {
        header() {
          return h('h1', {}, 'I\'m header')
        },
        body() {
          return h('section', {}, 'I\'m body')
        },
        footer() {
          return h('p', {}, 'I\'m footer')
        },
      }),
    ])
  },
  setup() {
  },
}
