import { h } from '../dist/index.mjs'
export const Emit = {
  props: {
    onAdd: Function,
  },
  render() {
    return h('button', { onClick: this.emitAdd }, 'emitAdd')
  },
  setup(props, { emit }) {
    const emitAdd = () => {
    //   console.log('emit add')
      emit('add', 1, 2)
    }
    return {
      emitAdd,
    }
  },
}
