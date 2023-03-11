import { describe, expect, it } from 'vitest'
import { templateParse } from '../src/templateParse'
describe('tokenzie', () => {
  it('parse props', () => {
    const ast = templateParse('<div :id="dynamicId"   @click="handler"  v-on:mousedown="onMouseDonw"></div>')
    expect(ast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [],
            "isSelfClosing": false,
            "props": [
              {
                "name": ":id",
                "type": "Attribute",
                "value": "dynamicId",
              },
              {
                "name": "@click",
                "type": "Attribute",
                "value": "handler",
              },
              {
                "name": "v-on:mousedown",
                "type": "Attribute",
                "value": "onMouseDonw",
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
  it('parse text', () => {
    const ast = templateParse('<div>Text</div>')
    expect(ast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "content": "Text",
                "type": "Text",
              },
            ],
            "isSelfClosing": false,
            "props": [],
            "tag": "div",
            "type": "Element",
          },
        ],
        "type": "Root",
      }
    `)
  })
  it('parse interpolation', () => {
    const ast = templateParse('<div>foo {{ bar }} baz</div>')
    expect(ast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "content": "foo ",
                "type": "Text",
              },
              {
                "content": {
                  "content": "bar",
                  "type": "Expression",
                },
                "type": "Interpolation",
              },
              {
                "content": " baz",
                "type": "Text",
              },
            ],
            "isSelfClosing": false,
            "props": [],
            "tag": "div",
            "type": "Element",
          },
        ],
        "type": "Root",
      }
    `)
  })
  it('parse comment', () => {
    const ast = templateParse('<div><!-- comments --> hello </div>')
    expect(ast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "content": {
                  "content": "comments",
                  "type": "Expression",
                },
                "type": "Comment",
              },
              {
                "content": " hello ",
                "type": "Text",
              },
            ],
            "isSelfClosing": false,
            "props": [],
            "tag": "div",
            "type": "Element",
          },
        ],
        "type": "Root",
      }
    `)
  })
})
