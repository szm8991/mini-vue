import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperNameMap } from './runtimeHelpers.js'

function createCodegenContext(
  ast: any,
  { runtimeModuleName = 'vue', runtimeGlobalName = 'Vue', mode = 'function' },
): any {
  const context = {
    code: '',
    mode,
    runtimeModuleName,
    runtimeGlobalName,
    helper(key) {
      return `_${helperNameMap[key]}`
    },
    push(code) {
      context.code += code
    },
    currentIndent: 0,
    newline() {
      context.code += `\n${'  '.repeat(context.currentIndent)}`
    },
    indent() {
      context.currentIndent++
      context.newline()
    },
    deIndent() {
      context.currentIndent--
      context.newline()
    },
  }

  return context
}
export function templateCodegen(node: any, options = {}) {
  const context = createCodegenContext(node, options)
  const { push, mode } = context

  if (mode === 'module')
    genModulePreamble(node, context)
  else
    genFunctionPreamble(node, context)

  const functionName = 'render'

  const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options']
  const signature = args.join(', ')
  push(`function ${functionName}(${signature}) {`)
  push('return ')
  genNode(node.codegenNode, context)

  push('}')

  return {
    code: context.code,
  }
}
function genNode(node: any, context: any) {
  switch (node.type) {
    // function render(_ctx, _cache, $props, $setup, $data, $options) {
    //   return "hi"
    // }
    case 'Text':
      genText(node, context)
      break
    // function render(_ctx, _cache, $props, $setup, $data, $options) {
    //   return _toDisplayString(_ctx.message)
    // }
    case 'Interpolation':
      genInterpolation(node, context)
      break
    case 'Expression':
      genExpression(node, context)
      break
    // function render(_ctx, _cache, $props, $setup, $data, $options) {
    //   return (_openBlock(), _createElementBlock("div"))
    // }
    case 'Element':
      genElement(node, context)
      break
    default:
      genEmpty(node, context)
      break
  }
}
function genElement(node, context) {
  const { push, helper } = context
  const { tag, props, children } = node

  push(`${helper(CREATE_ELEMENT_VNODE)}(`)

  genNodeList(genNullableArgs([tag, props, children]), context)

  push(')')
}
function genNodeList(nodes: any, context: any) {
  function genNodeList(nodes, context) {
    const { push } = context
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      genNode(node, context)
      if (i < nodes.length - 1)
        push(', ')
    }
  }
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node === 'string')
      push(`${node}`)
    else
      genNode(node, context)
    if (i < nodes.length - 1)
      push(', ')
  }
}
function genNullableArgs(args) {
  // 把末尾为null 的都删除掉
  // vue3源码中，后面可能会包含 patchFlag、dynamicProps 等编译优化的信息
  // 而这些信息有可能是不存在的，所以在这边的时候需要删除掉
  let i = args.length
  // 这里 i-- 用的还是特别的巧妙的
  // 当为0 的时候自然就退出循环了
  while (i--) {
    if (args[i] != null)
      break
  }
  // 把为 falsy 的值都替换成 "null"
  return args.slice(0, i + 1).map(arg => arg || 'null')
}
function genInterpolation(node: any, context: any) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}
function genExpression(node: any, context: any) {
  context.push(node.content, node)
}
function genEmpty(_, context) {
  const { push } = context
  push('{}')
}
function genModulePreamble(ast, context) {
  // preamble 就是 import 语句
  const { push, newline, runtimeModuleName } = context

  if (ast.helpers.length) {
    // 比如 ast.helpers 里面有个 [toDisplayString]
    // 那么生成之后就是 import { toDisplayString as _toDisplayString } from "vue"
    const code = `import {${ast.helpers
      .map(s => `${helperNameMap[s]} as _${helperNameMap[s]}`)
      .join(', ')} } from ${JSON.stringify(runtimeModuleName)}`

    push(code)
  }

  newline()
  push('export ')
}
function genFunctionPreamble(ast: any, context: any) {
  const { runtimeGlobalName, push, newline } = context
  const VueBinging = runtimeGlobalName

  const aliasHelper = s => `${helperNameMap[s]} : _${helperNameMap[s]}`

  if (ast.helpers.length > 0) {
    push(
      `
const { ${ast.helpers.map(aliasHelper).join(', ')}} = ${VueBinging} 

      `,
    )
  }

  newline()
  push('return ')
}
function genText(node: any, context: any) {
  const { push } = context
  push(`'${node.content}'`)
}
