import { TO_DISPLAY_STRING, helperNameMap } from './runtimeHelpers.js'

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

  if (mode === 'module') {
    // genModulePreamble(ast, context);
  }
  else {
    // genFunctionPreamble(ast, context);
  }
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
    default:
      genEmpty(node, context)
      break
  }
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
function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    genNode(node, context)
    if (i < nodes.length - 1)
      push(', ')
  }
}

function genFunctionDecl(node: any, context: any) {
  const { push, indent, deIndent } = context
  push(`function ${node.id.name}`)
  push('(')
  genNodeList(node.params, context)
  push(')')
  push('{')
  indent()
  node.body.forEach(n => genNode(n, context))
  deIndent()
  push('}')
}
function genArrayExpression(node: any, context: any) {
  const { push } = context
  push('[')
  genNodeList(node.elements, context)
  push(']')
}
function genReturnStatement(node: any, context: any) {
  const { push } = context
  push('return ')
  genNode(node.return, context)
}

function genText(node: any, context: any) {
  const { push } = context
  push(`'${node.content}'`)
}

function genCallExpression(node: any, context: any) {
  const { push } = context
  const { callee, arguments: args } = node
  push(`${callee.name}(`)
  genNodeList(args, context)
  push(')')
}
