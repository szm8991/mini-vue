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
