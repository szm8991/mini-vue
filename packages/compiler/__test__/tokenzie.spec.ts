import { describe, expect, it } from 'vitest'
import { tokenzie } from '../src'
describe('tokenzie', () => {
  it('tokenzied tag', () => {
    const tokens = tokenzie('<p>')
    expect(tokens).toEqual([{ type: 'tag', name: 'p' }])
  })
  it('tokenzied <p>Vue</p>', () => {
    const tokens = tokenzie('<p>hello</p>')
    expect(tokens).toEqual([
      { type: 'tag', name: 'p' },
      { type: 'text', content: 'hello' },
      { type: 'tagEnd', name: 'p' },
    ])
  })
})
