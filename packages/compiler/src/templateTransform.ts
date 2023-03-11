interface TransformContext {
  currentNode: NodeType | null
  childIdx: number
  parent: NodeType | null
  nodeTransforms: Function[]
}
interface NodeType {
  type: string
  tag?: string | undefined
  content?: string | undefined
  children?: NodeType[]
  jsNode?: any
}
function traverseNode(ast: any, context: any) {
  context.currentNode = ast
  // exit stage callback functions
  const exitFns: Function[] = []
  // 对当前ast做一些转换工作
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    const onExit = transforms[i](context.currentNode, context)
    if (onExit)
      exitFns.push(onExit)

    if (!context.currentNode)
      return
  }
  // 递归处理子节点
  traverseChildren(context)
  let i = exitFns.length
  while (i--)
    exitFns[i]()
}
function traverseChildren(context: any) {
  const children = context.currentNode.children
  if (children) {
    const parent = context.currentNode
    for (let i = 0; i < children.length; i++) {
      context.parent = parent
      context.childIdx = i
      traverseNode(children[i], context)
    }
  }
}
function createTransformContext(root, options): TransformContext {
  const context = {
    currentNode: root,
    childIdx: 0,
    parent: null,
    nodeTransforms: options.nodeTransforms || [],
  }

  return context
}

export function templateTransform(ast: NodeType, options = {}) {
  const context: TransformContext = createTransformContext(ast, options)
  traverseNode(ast, context)
}
