import { describe, expect, it } from 'vitest'
import { dump, dumpEnterandExit, parse, transform, union } from '../src'
import { generate } from '../src/codegen'
describe('tokenzie', () => {
  it('test dump output', () => {
    const ast = parse('<div><p>Vue</p><p>Template</p></div>')
    console.log('----------------------------origin--------------------------------')
    dump(ast)
  })
  it('test jsNode output', () => {
    const ast = parse('<div><p>Vue</p><p>Template</p></div>')
    console.log('--------------------------transform----------------------------------')
    transform(ast)
    const code = generate(ast.jsNode)
    expect(code).toMatchInlineSnapshot(`
      "function render(){
        return h('div', {}, [h('p', {}, 'Vue'), h('p', {}, 'Template')])
      }"
    `)
  })

  it('test enter and exit output', () => {
    dumpEnterandExit()
    expect(union).toMatchInlineSnapshot(`
      [
        "transformA进入阶段执行",
        "transformB进入阶段执行",
        "transformB退出阶段执行",
        "transformA退出阶段执行",
      ]
    `)
  })
})
