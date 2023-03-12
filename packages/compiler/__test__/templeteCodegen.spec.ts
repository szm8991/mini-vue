import { describe, expect, it } from 'vitest'
import { templateCodegen } from '../src/templateCodegen'
import { templateParse } from '../src/templateParse'
import { templateTransform } from '../src/templateTransform'
import { transformExpression } from '../src/transforms'
describe('condegen', () => {
  it('Text', () => {
    const ast = templateParse('hi')
    templateTransform(ast)
    const { code } = templateCodegen(ast)
    expect(code).toMatchInlineSnapshot('"function render(_ctx, _cache, \$props, \$setup, \$data, \$options) {return \'hi\'}"')
  })
  it('Interpolation', () => {
    const ast = templateParse('{{hello}}')
    templateTransform(ast, {
      nodeTransforms: [transformExpression],
    })

    const { code } = templateCodegen(ast)
    expect(code).toMatchInlineSnapshot('"function render(_ctx, _cache, \$props, \$setup, \$data, \$options) {return _toDisplayString(_ctx.hello)}"')
  })
})
