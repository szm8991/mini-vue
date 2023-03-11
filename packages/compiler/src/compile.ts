import { generate } from './codegen.js'
import { parse, transform } from './parse.js'

export function baseCompile(template: string) {
  // 生成HTML模板字符串
  const ast = parse(template)
  // 将模板HTML转化为js AST
  transform(ast)
  // 生成render函数代码
  const code = generate(ast.jsNode)
  return code
}
