import { baseCompile } from './compile.js'
import { templateParse } from './templateParse.js'
import { templateTransform } from './templateTransform.js'

export * from './codegen.js'
export * from './compile.js'
export * from './parse.js'
export * from './templateParse.js'
export * from './templateTransform.js'
export * from './tokenzie.js'

baseCompile('<div><p>Vue</p><p>Template</p></div>')
templateTransform(templateParse('<div>hello {{ world }}</div>'))
