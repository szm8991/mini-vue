// export * from './tokenzie.js'
// export * from './parse.js'
// export * from './codegen.js'
// export * from './compile.js'
export * from './templateCodegen.js'
export * from './templateCompile.js'
export * from './templateParse.js'
export * from './templateTransform.js'

// baseCompile('<div><p>Vue</p><p>Template</p></div>')
// templateTransform(templateParse('<div>hello {{ world }}</div>'))
// templateCodegen(templateTransform(templateParse('hi')))
// templateCodegen(templateTransform(templateParse('{{message}}')))
// templateCodegen(templateTransform(templateParse('<div>hi,{{msg}}</div>'), {
//   nodeTransforms: [transformElement, transformExpression, transformCompundExpression],
// }))
