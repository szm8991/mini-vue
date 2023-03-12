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
  const type = ast.type
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
  switch (type) {
    case 'Root':
    case 'Element':
      traverseChildren(context)
      break
    default:
      break
  }
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
    helpers: new Map(),
    helper(name) {
      // helpers 数据会在后续生成代码的时候用到
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
    },
  }

  return context
}
function createRootCodegen(root: any, context: any) {
  const { children } = root

  const child = children[0]

  // codegenNode 的目的是专门为了 codegen 准备的  为的就是和 ast 的 node 分离开
  if (child.type === 'Element' && child.codegenNode) {
    const codegenNode = child.codegenNode
    root.codegenNode = codegenNode
  }
  else {
    root.codegenNode = child
  }
}
export function templateTransform(ast: NodeType, options = {}) {
  const context: TransformContext = createTransformContext(ast, options)
  traverseNode(ast, context)
  createRootCodegen(ast, context)
  return ast
}
