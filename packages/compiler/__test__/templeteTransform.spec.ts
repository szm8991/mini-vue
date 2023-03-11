import { describe, expect, it } from 'vitest'
import { templateParse } from '../src/templateParse'
import { templateTransform } from '../src/templateTransform'
describe('tokenzie', () => {
  it('parse props', () => {
    const ast = templateParse('<div>hello {{ world }}</div>')

    const calls: any[] = []
    const plugin = (node, context) => {
      calls.push([node, { ...context }])
    }
    // root->div->text & interpolation
    templateTransform(ast, {
      nodeTransforms: [plugin],
    })

    const div = ast.children[0]
    expect(calls.length).toBe(4)
    expect(calls[0]).toMatchObject([
      ast,
      {
        parent: null,
        currentNode: ast,
      },
    ])
    expect(calls[1]).toMatchObject([
      div,
      {
        parent: ast,
        currentNode: div,
      },
    ])
    expect(calls[2]).toMatchObject([
      div.children[0],
      {
        parent: div,
        currentNode: div.children[0],
      },
    ])
    console.log(calls[3])
    expect(calls[3]).toMatchObject([
      div.children[1],
      {
        parent: div,
        currentNode: div.children[1],
      },
    ])
  })
})
