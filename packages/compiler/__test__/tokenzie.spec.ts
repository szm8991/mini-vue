import { tokenzie } from '../src'
import { describe, it, expect } from 'vitest'
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
