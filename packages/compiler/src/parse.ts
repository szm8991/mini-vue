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
// 遍历ast，方便进行后续transform，深度优先遍历
function traverseNode(ast: NodeType, context: TransformContext) {
  context.currentNode = ast
  // exit stage callback functions
  const exitFns: Function[] = []
  // 对当前ast做一些转换工作
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    const onExit = transforms[i](context.currentNode, context)
    if (onExit) exitFns.push(onExit)
    if (!context.currentNode) return
  }
  // 递归处理子节点
  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIdx = i
      traverseNode(children[i], context)
    }
  }
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}
export type TransformContext = {
  currentNode: NodeType | null
  childIdx: number
  parent: NodeType | null
  replaceNode: (node: NodeType) => void
  nodeTransforms: Function[]
  removeNode: () => void
  addNode: (node: NodeType) => void
}
export function transform(ast: NodeType) {
  const context: TransformContext = {
    currentNode: null,
    childIdx: 0,
    parent: null,
    replaceNode(node: NodeType) {
      context.currentNode = node
      context.parent!.children![context.childIdx] = node
    },
    removeNode() {
      if (context.parent) {
        context.parent.children?.splice(context.childIdx, 1)
        context.currentNode = null
      }
    },
    addNode(node: NodeType) {
      if (context.parent) {
        context.parent.children?.push(node)
      }
    },
    nodeTransforms: [transformElement, transformText],
  }
  traverseNode(ast, context)
  dump(ast)
}
export function dumpEnterandExit(ast: NodeType = { type: 'Root', children: [] }) {
  const context: TransformContext = {
    currentNode: null,
    childIdx: 0,
    parent: null,
    replaceNode(node: NodeType) {
      context.currentNode = node
      context.parent!.children![context.childIdx] = node
    },
    removeNode() {
      if (context.parent) {
        context.parent.children?.splice(context.childIdx, 1)
        context.currentNode = null
      }
    },
    addNode(node: NodeType) {
      context.currentNode!.children?.push(node)
      context.currentNode = node
    },
    nodeTransforms: [transformA, transformB],
  }
  traverseNode(ast, context)
}
function transformElement(node: NodeType): void | (() => void) {
  if (node.type === 'Element' && node.tag === 'p') {
    node.tag = 'h1'
  }
}
function transformText(node: NodeType, context: TransformContext): void | (() => void) {
  if (node.type === 'Text') {
    // context.removeNode()
    context.replaceNode({
      type: 'Element',
      tag: 'span',
    })
  }
}
export const union: string[] = []
function transformA(node: NodeType, context: TransformContext): void | (() => void) {
  union.push('transformA进入阶段执行')
  return () => union.push('transformA退出阶段执行')
}
function transformB(node: NodeType, context: TransformContext): void | (() => void) {
  union.push('transformB进入阶段执行')
  return () => union.push('transformB退出阶段执行')
}
