import { Fragment, h } from '../dist/index.mjs'
import { Slot } from './Slot.js'
export const App = {
  name: 'app',
  render() {
    return h(Fragment, {}, [h(Slot, {},
      {
        header(props) {
          return h('h1', {}, `I'm header${props.age}`)
        },
        body(props) {
          return h('section', {}, `I'm body${props.age}`)
        },
        footer(props) {
          return h('p', {}, `I'm footer${props.age}`)
        },
      }),
    ])
  },
  setup() {
  },
}
