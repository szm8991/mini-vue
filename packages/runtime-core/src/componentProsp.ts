function resolveProps(optios, propsData) {
  const props = {}
  const attrs = {}
  for (const key in propsData) {
    if (key in optios)
      props[key] = propsData[key]
    else attrs[key] = propsData[key]
  }
  return [props, attrs]
}
export function initProps(instance) {
  const [props, attrs] = resolveProps(instance.type.props, instance.vnode.props)
  instance.props = props
  instance.attrs = attrs
}
