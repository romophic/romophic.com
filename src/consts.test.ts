import { describe, it, expect } from 'vitest'
import { getSocialIcon, ICONS } from './consts'

describe('getSocialIcon', () => {
  it('maps known social labels to their icon name', () => {
    expect(getSocialIcon('GitHub')).toBe('lucide:github')
    expect(getSocialIcon('Email')).toBe('lucide:mail')
  })

  it('falls back to the generic link icon for unknown labels', () => {
    expect(getSocialIcon('Mastodon')).toBe(ICONS.link)
  })
})
