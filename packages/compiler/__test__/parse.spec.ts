import { parse } from '../src'
import { describe, it, expect } from 'vitest'
describe('tokenzie', () => {
  it('parse <div><p>Vue</p><p>Template</p></div>', () => {
    const ast = parse('<div><p>Vue</p><p>Template</p></div>')
    expect(ast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "content": "Vue",
                    "type": "Text",
                  },
                ],
                "tag": "p",
                "type": "Element",
              },
              {
                "children": [
                  {
                    "content": "Template",
                    "type": "Text",
                  },
                ],
                "tag": "p",
                "type": "Element",
              },
            ],
            "tag": "div",
            "type": "Element",
          },
        ],
        "type": "Root",
      }
    `)
  })
})
