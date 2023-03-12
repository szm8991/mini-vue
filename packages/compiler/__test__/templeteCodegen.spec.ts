import { describe, expect, it } from 'vitest'
import { templateCodegen } from '../src/templateCodegen'
import { templateParse } from '../src/templateParse'
import { templateTransform } from '../src/templateTransform'
import { transformCompundExpression, transformElement, transformExpression } from '../src/transforms'
describe('condegen', () => {
  it('Text', () => {
    const ast = templateParse('hi')
    templateTransform(ast)
    const { code } = templateCodegen(ast)
    expect(code).toMatchInlineSnapshot(`
      "
      return function render(_ctx, _cache, \$props, \$setup, \$data, \$options) {return 'hi'}"
    `)
  })
  it('Interpolation', () => {
    const ast = templateParse('{{hello}}')
    templateTransform(ast, {
      nodeTransforms: [transformExpression],
    })

    const { code } = templateCodegen(ast)
    expect(code).toMatchInlineSnapshot(`
      "
      const { toDisplayString : _toDisplayString} = Vue 
      
            
      return function render(_ctx, _cache, \$props, \$setup, \$data, \$options) {return _toDisplayString(_ctx.hello)}"
    `)
  })
  it('Element', () => {
    const ast = templateParse('<div></div>')
    templateTransform(ast, {
      nodeTransforms: [transformElement],
    })

    const { code } = templateCodegen(ast)
    expect(code).toMatchInlineSnapshot(`
      "
      const { createElementVNode : _createElementVNode} = Vue 
      
            
      return function render(_ctx, _cache, \$props, \$setup, \$data, \$options) {return _createElementVNode('div')}"
    `)
  })
  it('mixed', () => {
    const ast = templateParse('<div>hi,{{msg}}</div>')
    templateTransform(ast, {
      nodeTransforms: [transformElement, transformExpression, transformCompundExpression],
    })

    const { code } = templateCodegen(ast)
    expect(code).toMatchInlineSnapshot(`
      "
      const { toDisplayString : _toDisplayString, createElementVNode : _createElementVNode} = Vue 
      
            
      return function render(_ctx, _cache, \$props, \$setup, \$data, \$options) {return _createElementVNode('div', null, 'hi,' + _toDisplayString(_ctx.msg))}"
    `)
  })
})
