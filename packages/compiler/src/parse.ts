import { tokenzie } from './tokenzie'
export type NodeType = {
  type: string
  tag?: string | undefined
  content?: string | undefined
  children?: NodeType[]
}
export function parse(str) {
  const tokens = tokenzie(str)
  const root: NodeType = {
    type: 'Root',
    children: [],
  }
  const elementStack = [root]
  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1]
    const t = tokens[0]
    switch (t.type) {
      case 'tag':
        const elementNode: NodeType = {
          type: 'Element',
          tag: t.name,
          children: [],
        }
        parent.children!.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        const textNode: NodeType = {
          type: 'Text',
          content: t.content,
        }
        parent.children!.push(textNode)
        break
      case 'tagEnd':
        elementStack.pop()
        break
    }
    tokens.shift()
  }
  return root
}
// 辅助函数，查看ast结构，深度优先遍历
export function dump(node: NodeType, indent: number = 0) {
  const type = node.type
  const desc = node.type === 'Root' ? '' : node.type === 'Element' ? node.tag : node.content
  console.log(`${'-'.repeat(indent)}${type}: ${desc}`)
  if (node.children) {
    node.children.forEach(n => dump(n, indent + 2))
  }
}
// 遍历ast，深度优先遍历
function traverseNode(ast: NodeType, context) {
  const currentNode = ast
  // 对当前ast做一些转换工作
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    transforms[i](currentNode, context)
  }
  // 递归处理子节点
  const children = ast.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIdx = i
      traverseNode(children[i], context)
    }
  }
}
export type TransformContext = {
  currentNode: NodeType | null
  childIdx: number
  parent: NodeType | null
  replaceNode: (node: NodeType) => void
  nodeTransforms: Function[]
}
export function transform(ast: NodeType) {
  const context: TransformContext = {
    currentNode: null,
    childIdx: 0,
    parent: null,
    replaceNode(node: NodeType) {
      context.parent!.children![context.childIdx] = node
      context.currentNode = node
    },
    nodeTransforms: [transformElement, transformText],
  }
  traverseNode(ast, context)
  dump(ast)
}
function transformElement(node: NodeType) {
  if (node.type === 'Element' && node.tag === 'p') {
    node.tag = 'h1'
  }
}
function transformText(node: NodeType, context: TransformContext) {
  if (node.type === 'Text') {
    context.replaceNode({
      type: 'Element',
      tag: 'span',
    })
  }
}
