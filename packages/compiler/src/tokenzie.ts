const enum State {
  initial = 1, // 初始状态
  tagOpen = 2, // 标签开始状态
  tagName = 3, // 标签名称状态
  text = 4, // 文本状态
  tagEnd = 5, // 结束标签状态
  tagEndName = 6, // 结束标签名称状态
}
export type MyToken = {
  type: string
  content?: string
  name?: string
}
// 判断是否是字母
function isAlpha(char: string) {
  return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
}
// 利用有限状态机实现tokenized
export function tokenzie(str: string) {
  // 状态机当前状态
  let currengState = State.initial
  //用于缓存字符
  const chars: string[] = []
  //生成的 Token会存储到tokens数组中，并作为函数的返回值返回
  const tokens: MyToken[] = []
  while (str) {
    // 查看第一个字符
    const char: string = str[0]
    switch (currengState) {
      case State.initial:
        if (char === '<') {
          // 切换状态并消费字符
          currengState = State.tagOpen
          str = str.slice(1)
        } else if (isAlpha(char)) {
          currengState = State.text
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.tagOpen:
        if (isAlpha(char)) {
          // 切换状态并消费字符
          currengState = State.tagName
          chars.push(char)
          str = str.slice(1)
        } else if (char === '/') {
          currengState = State.tagEnd
          str = str.slice(1)
        }
        break
      case State.tagName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          currengState = State.initial
          tokens.push({
            type: 'tag',
            name: chars.join(''),
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.text:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '<') {
          currengState = State.tagOpen
          tokens.push({
            type: 'text',
            content: chars.join(''),
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.tagEnd:
        if (isAlpha(char)) {
          currengState = State.tagEndName
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.tagEndName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          currengState = State.initial
          tokens.push({
            type: 'tagEnd',
            name: chars.join(''),
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
    }
  }
  return tokens
}
