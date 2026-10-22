import { describe, it, expect } from 'vitest'
import { GISCUS_CONFIG } from '@/consts'
import {
  GISCUS_IFRAME_ORIGIN,
  GISCUS_SCRIPT_URL,
  giscusEmbedAttributes,
  giscusSetConfigMessage,
  giscusTheme,
  giscusThemeUrl,
} from './giscus'

describe('giscus (Test as Documentation)', () => {
  describe('giscusTheme', () => {
    it('maps the dark document class to the transparent_dark giscus theme', () => {
      expect(giscusTheme(true)).toBe('transparent_dark')
      expect(giscusTheme(false)).toBe('light')
    })
  })

  describe('giscusEmbedAttributes', () => {
    it('builds the dataset the official client script reads from currentScript', () => {
      expect(giscusEmbedAttributes('transparent_dark')).toEqual({
        repo: GISCUS_CONFIG.repo,
        repoId: GISCUS_CONFIG.repoId,
        category: GISCUS_CONFIG.category,
        categoryId: GISCUS_CONFIG.categoryId,
        mapping: GISCUS_CONFIG.mapping,
        strict: GISCUS_CONFIG.strict,
        reactionsEnabled: GISCUS_CONFIG.reactionsEnabled,
        emitMetadata: GISCUS_CONFIG.emitMetadata,
        inputPosition: GISCUS_CONFIG.inputPosition,
        lang: GISCUS_CONFIG.lang,
        loading: GISCUS_CONFIG.loading,
        theme: 'transparent_dark',
      })
    })

    it('never pins a term: the client script derives it from location.pathname at injection time', () => {
      // Core of the ClientRouter fix: mounting after the swap keeps the term
      // aligned with the current page. A pinned term (or a location-free
      // mapping) would freeze the discussion to the page it rendered on.
      const attrs = giscusEmbedAttributes('light')

      expect(attrs.term).toBeUndefined()
      expect(attrs.mapping).toBe('pathname')
    })
  })

  describe('giscusSetConfigMessage', () => {
    it('builds the documented setConfig message for live theme updates', () => {
      expect(giscusSetConfigMessage('light')).toEqual({
        giscus: { setConfig: { theme: 'light' } },
      })
      expect(giscusSetConfigMessage('transparent_dark')).toEqual({
        giscus: { setConfig: { theme: 'transparent_dark' } },
      })
    })
  })

  describe('giscusThemeUrl', () => {
    it('replaces the theme before the lazy iframe boots and keeps other parameters', () => {
      const url = new URL(
        giscusThemeUrl(
          'https://giscus.app/widget?repo=romophic%2Fromophic.com&theme=transparent_dark&lang=ja',
          'light',
        ),
      )

      expect(url.searchParams.get('theme')).toBe('light')
      expect(url.searchParams.get('lang')).toBe('ja')
      expect(url.searchParams.get('repo')).toBe('romophic/romophic.com')
    })
  })

  it('points at the official embed script and messaging origin', () => {
    expect(GISCUS_SCRIPT_URL).toBe('https://giscus.app/client.js')
    expect(GISCUS_IFRAME_ORIGIN).toBe('https://giscus.app')
  })
})
