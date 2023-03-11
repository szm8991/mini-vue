import { baseCompile } from './compile.js'
import { parseTemplate } from './parseTemplate.js'

export * from './codegen.js'
export * from './compile.js'
export * from './parse.js'
export * from './parseTemplate.js'
export * from './tokenzie.js'

baseCompile('<div><p>Vue</p><p>Template</p></div>')
parseTemplate('<div>foo {{ bar }} baz</div>')
