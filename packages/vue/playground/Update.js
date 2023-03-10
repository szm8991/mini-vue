import { h, ref } from '../dist/index.mjs'
export const Update = {
  name: 'Update',
  props: {
    foo: String,
    onChangeProp: Function,
  },
  render(args) {
    return h('div', { foo: this.foo },
      [
        h('div', {}, `count:${this.count}`),
        h('button', { onClick: this.onClick }, 'count plus'),
        // h('div', {}, `foo:${this.foo}`),
        h('button', { onClick: this.emitChangeProp }, 'change prop'),
      ])
  },
  setup(props, { emit }) {
    const count = ref(0)
    const onClick = () => {
      count.value++
      console.log(count.value)
    }
    const emitChangeProp = () => {
      emit('changeProp')
    }
    return {
      count,
      onClick,
      emitChangeProp,
    }
  },
}
