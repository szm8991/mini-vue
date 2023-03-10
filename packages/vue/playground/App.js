import { Fragment, h } from '../dist/index.mjs'
// import { ArrayToText } from './ArrayToText.js'
// import { TextToArray } from './TextToArray.js'
import { ArrayToArray } from './ArrayToArray.js'
export const App = {
  name: 'app',
  render() {
    return h(Fragment, { }, [
      // h(ArrayToText, {}),
      // h(TextToArray, {}),
      h(ArrayToArray, {}),
    ])
  },
  setup() {

  },
}
