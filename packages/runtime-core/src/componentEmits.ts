import { camelize, toHandlerKey } from '@ming/shared'
export function emit(instance, event: string, ...rawArgs) {
  // 所以我们先从 props 中看看是否有对应的 event handler
  const props = instance.props
  // ex: event -> click 那么这里取的就是 onClick
  // 让事情变的复杂一点如果是烤肉串命名的话，需要转换成  change-page -> changePage
  const handler = props[toHandlerKey(camelize(event))]

  if (handler)
    handler(...rawArgs)
}
