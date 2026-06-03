import { describe, it, expect } from 'vitest'
import { getTechBadge, TECH_BADGES } from './tech-badges'

describe('tech-badges', () => {
  it('should return the correct badge for a known tech', () => {
    const badge = getTechBadge('React')
    expect(badge).toEqual({
      icon: TECH_BADGES['React'].icon,
      colorClass: expect.any(String)
    })
  })

  it('should return null for an unknown tech', () => {
    const badge = getTechBadge('UnknownTech')
    expect(badge).toBeNull()
  })
})
