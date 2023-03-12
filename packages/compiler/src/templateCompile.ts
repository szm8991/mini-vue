import { templateCodegen } from './templateCodegen.js'
import { templateParse } from './templateParse.js'
import { templateTransform } from './templateTransform.js'
import { transformCompundExpression, transformElement, transformExpression } from './transforms/index.js'

export function templateBaseCompile(template: string, options = {}) {
  // 生成HTML模板字符串
  const ast = templateParse(template)
  // 将模板HTML转化为js AST
  templateTransform(ast, Object.assign(options, {
    nodeTransforms: [transformElement, transformExpression, transformCompundExpression],
  }))
  return templateCodegen(ast)
}
