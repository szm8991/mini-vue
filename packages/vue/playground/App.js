import { Fragment, h } from '../dist/index.mjs'
import { ArrayToText } from './ArrayToText.js'
export const App = {
  name: 'app',
  render() {
    return h(Fragment, { }, [h(ArrayToText), {}])
  },
  setup() {

  },
}
