import { CREATE_ELEMENT_VNODE } from '../runtimeHelpers.js'

function createVNodeCall(context, tag, props?, children?) {
  if (context)
    context.helper(CREATE_ELEMENT_VNODE)

  return {
    type: 'Element',
    tag,
    props,
    children,
  }
}
export function transformElement(node, context) {
  if (node.type === 'Element') {
    return () => {
      // TODO
      // 没有实现 block  所以这里直接创建 element
      const vnodeTag = `'${node.tag}'`
      // TODO props 暂时不支持
      const vnodeProps = null
      let vnodeChildren = null
      if (node.children.length > 0) {
        if (node.children.length === 1) {
          const child = node.children[0]
          vnodeChildren = child
        }
      }

      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren,
      )
    }
  }
}
