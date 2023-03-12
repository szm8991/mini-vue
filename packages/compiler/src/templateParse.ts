const enum TextModes {
  DATA = 1,
  RCDATA = 2,
  RAWTEXT = 3,
  CDATA = 4,
}
const enum TagType {
  Start,
  End,
}
function advanceBy(context, num) {
  context.source = context.source.slice(num)
}
function advanceSpaces(context) {
  const match = /^[\t\r\n\f ]+/.exec(context.source)
  if (match)
    advanceBy(context, match[0].length)
}
function createRoot(children) {
  return {
    type: 'Root',
    children,
    helpers: [],
  }
}
function createParserContext(str) {
  return {
    source: str,
    mode: TextModes.DATA,
  }
}
function isEnd(context: any, ancestors) {
  if (!context.source)
    return true
  if (context.source.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; --i) {
      if (context.source.startsWith(`</${ancestors[i].tag}`))
        return true
    }
  }
  return false
}
function parseChildren(context, ancestors) {
  const nodes: any = []
  while (!isEnd(context, ancestors)) {
    const { mode, source } = context
    let node
    // DATA模式和RCDATA模式才支持插值节点解析
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      // DATA模式才支持标签节点解析
      if (mode === TextModes.DATA && source[0] === '<') {
        if (source[1] === '!') {
          // 注释节点
          if (source.startsWith('<!--')) {
            // todo
            node = parseComment(context)
          }
          else if (source.startsWith('<![CDATA[')) {
            // todo
            // node = parseCDATA(context, ancestors)
          }
        }
        else if (source[1] === '/') {
          console.error('无效的结束标签')
          continue
        }
        else if (/[a-z]/i.test(source[1])) {
          node = parseElement(context, ancestors)
        }
      }
      // 插值解析
      else if (source.startsWith('{{')) {
        node = parseInterpolation(context)
      }
    }

    if (!node)
      node = parseText(context)

    nodes.push(node)
  }
  return nodes
}
function parseElement(context, ancestors) {
  const element = parseTag(context, TagType.Start)
  if (element.isSelfClosing)
    return element
  // 切换到正确的文本模式
  if (element.tag === 'textarea' || element.tag === 'title')
    context.mode = TextModes.RCDATA
  else if (/style|xmp|iframe|noembed|noframes|noscript/.test(element.tag))
    context.mode = TextModes.RAWTEXT
  else
    context.mode = TextModes.DATA

  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (context.source.startsWith(`</${element.tag}`))
    parseTag(context, TagType.End)
  else
    console.error(`缺失结束标签：${element.tag}`)

  return element
}
function parseTag(context: any, type: TagType): any {
  // 检测开始标签或者闭合标签
  const match: any = type === TagType.Start
    ? /^<([a-z][^\r\n\t\f />]*)/i.exec(context.source)
    : /^<\/([a-z][^\r\n\t\f />]*)/i.exec(context.source)
  const tag = match[1]

  advanceBy(context, match[0].length)
  advanceSpaces(context)
  const props = parseAttributes(context)
  const isSelfClosing = context.source.startsWith('/>')
  advanceBy(context, isSelfClosing ? 2 : 1)

  if (type === TagType.End)
    return

  return {
    type: 'Element',
    tag,
    props,
    children: [],
    isSelfClosing,
  }
}
function parseAttributes(context) {
  const props: any[] = []
  while (
    !context.source.startsWith('>')
        && !context.source.startsWith('/>')
  ) {
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
    // 属性名
    const name = match![0]
    // 消费属性名
    advanceBy(context, name.length)
    advanceSpaces(context)
    // 消费 =
    advanceBy(context, 1)
    advanceSpaces(context)
    let value = ''
    const quote = context.source[0]
    const isQuoted = quote === '"' || quote === '\''
    if (isQuoted) {
      // 消费 开始的'或“
      advanceBy(context, 1)
      const endQuoteIndex = context.source.indexOf(quote)
      if (endQuoteIndex > -1) {
        value = context.source.slice(0, endQuoteIndex)
        advanceBy(context, value.length)
        // 消费 结束的'或”
        advanceBy(context, 1)
      }
      else {
        console.error(`缺少属性值结束引号:${quote}`)
      }
    }
    else {
      const match = /^[^\t\r\n\f >]]*/.exec(context.source)
      value = match![0]
      advanceBy(context, value.length)
    }
    advanceSpaces(context)
    props.push({
      type: 'Attribute',
      name,
      value,
    })
  }
  return props
}
function parseText(context): any {
  const endTokens = ['<', '{{']
  let endIndex = context.source.length
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if (index !== -1 && endIndex > index)
      endIndex = index
  }
  const content = context.source.slice(0, endIndex)
  advanceBy(context, content.length)

  return {
    type: 'Text',
    content,
  }
}

function parseInterpolation(context) {
  // 消费 {{
  advanceBy(context, '{{'.length)
  const closeIndex = context.source.indexOf('}}')
  if (closeIndex < -1)
    console.error('插值缺少结束定界符}}')

  const content = context.source.slice(0, closeIndex)
  advanceBy(context, content.length)
  // 消费 }}
  advanceBy(context, '}}'.length)
  return {
    type: 'Interpolation',
    content: {
      type: 'Expression',
      content: content.trim(),
    },
  }
}

function parseComment(context) {
  // 消费 {{
  advanceBy(context, '<!--'.length)
  const closeIndex = context.source.indexOf('-->')
  if (closeIndex < -1)
    console.error('注释缺少结束定界符}}')

  const content = context.source.slice(0, closeIndex)
  advanceBy(context, content.length)
  // 消费 }}
  advanceBy(context, '-->'.length)
  return {
    type: 'Comment',
    content: {
      type: 'Expression',
      content: content.trim(),
    },
  }
}

export function templateParse(str: string) {
  const context = createParserContext(str)
  return createRoot(parseChildren(context, []))
}
