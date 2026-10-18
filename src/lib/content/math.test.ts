import { describe, it, expect } from 'vitest'
import { hasMathContent } from './math'

describe('hasMathContent', () => {
  it('detects inline math', () => {
    expect(hasMathContent('計算量は $O(\\log n)$ です')).toBe(true)
  })

  it('detects display math spanning multiple lines', () => {
    expect(hasMathContent('$$\n\\sum_{i=1}^n i = \\frac{n(n+1)}{2}\n$$')).toBe(
      true,
    )
  })

  it('ignores dollar signs inside fenced code blocks', () => {
    expect(hasMathContent('```sh\necho $A $B\n```')).toBe(false)
  })

  it('ignores dollar signs inside inline code', () => {
    expect(hasMathContent('`$A + $B` を返す')).toBe(false)
  })

  it('returns false for plain text and missing bodies', () => {
    expect(hasMathContent('ただの文章です')).toBe(false)
    expect(hasMathContent('')).toBe(false)
    expect(hasMathContent(undefined)).toBe(false)
    expect(hasMathContent(null)).toBe(false)
  })
})
