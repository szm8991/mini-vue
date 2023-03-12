import { describe, expect, it } from 'vitest'
import { templateCodegen } from '../src/templateCodegen'
import { templateParse } from '../src/templateParse'
import { templateTransform } from '../src/templateTransform'
describe('condegen', () => {
  it('1', () => {
    const ast = templateParse('hi')
    templateTransform(ast)
    const { code } = templateCodegen(ast)
    expect(code).toMatchInlineSnapshot('"function render(_ctx, _cache, \$props, \$setup, \$data, \$options) {return \'hi\'}"')
  })
})
