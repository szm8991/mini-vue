import { templateBaseCompile } from '@ming/compiler'
import * as runtimeDom from '@ming/runtime-dom'
import { registerRuntimeCompiler } from '@ming/runtime-dom'

function compileToFunction(template, options = {}) {
  const { code } = templateBaseCompile(template, options)
  // eslint-disable-next-line no-new-func
  const render = new Function('Vue', code)(runtimeDom)
  return render
}
registerRuntimeCompiler(compileToFunction)
export * from '@ming/runtime-dom'
