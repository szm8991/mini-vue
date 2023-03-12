export function isText(node) {
  return node.type === 'Interpolation' || node.type === 'Text'
}
export function transformCompundExpression(node, context) {
  if (node.type === 'Element') {
    // 在 exit 的时期执行
    return () => {
      // hi,{{msg}}
      // 上面的模块会生成2个节点，一个是 text 一个是 interpolation 的话
      // 生成的 render 函数应该为 "hi," + _toDisplayString(_ctx.msg)
      // 这里面就会涉及到添加一个 “+” 操作符
      // 那这里的逻辑就是处理它

      // 检测下一个节点是不是 text 类型，如果是的话， 那么会创建一个 COMPOUND 类型
      // COMPOUND 类型把 2个 text || interpolation 包裹（相当于是父级容器）
      const children = node.children
      let currentContainer
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: 'CompundExpression',
                  children: [child],
                }
              }
              currentContainer.children.push(' + ', next)
              children.splice(j, 1)
              j--
            }
            else {
              currentContainer = undefined
              break
            }
          }
        }
      }
    }
  }
}
