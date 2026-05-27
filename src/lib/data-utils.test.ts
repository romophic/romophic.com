import { describe, it, expect } from 'vitest'
import * as DataUtils from './data-utils'

describe('data-utils', () => {
  it('should export all required functions', () => {
    expect(DataUtils.getAllPosts).toBeDefined()
    expect(DataUtils.getRecentPosts).toBeDefined()
    expect(DataUtils.getPostPageData).toBeDefined()
    expect(typeof DataUtils.getPostPageData).toBe('function')
  })
})
