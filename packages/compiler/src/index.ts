import { templateCodegen } from './templateCodegen.js'
import { templateParse } from './templateParse.js'
import { templateTransform } from './templateTransform.js'
import { transformCompundExpression, transformElement, transformExpression } from './transforms/index.js'
export * from './codegen.js'
export * from './compile.js'
export * from './parse.js'
export * from './templateCodegen.js'
export * from './templateParse.js'
export * from './templateTransform.js'
export * from './tokenzie.js'

// baseCompile('<div><p>Vue</p><p>Template</p></div>')
// templateTransform(templateParse('<div>hello {{ world }}</div>'))
// templateCodegen(templateTransform(templateParse('hi')))
// templateCodegen(templateTransform(templateParse('{{message}}')))
templateCodegen(templateTransform(templateParse('<div>hi,{{msg}}</div>'), {
  nodeTransforms: [transformElement, transformExpression, transformCompundExpression],
}))
