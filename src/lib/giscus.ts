/**
 * Helpers for the official giscus embed (https://giscus.app/client.js).
 *
 * The client script derives the discussion term from `location.pathname` and
 * reads `data-theme` at the moment it executes. That is why the site injects
 * the script after every client-side navigation (astro:page-load): both
 * values are then guaranteed to reflect the page the visitor is actually on.
 * Never pin `term` or use a location-independent mapping, and never mount
 * before the swap - that is exactly the race the official embed avoids by
 * construction.
 */
import { GISCUS_CONFIG } from '@/consts'

export const GISCUS_SCRIPT_URL = 'https://giscus.app/client.js'
export const GISCUS_IFRAME_ORIGIN = 'https://giscus.app'

export type GiscusTheme = 'light' | 'transparent_dark'

/**
 * Maps the document state to a giscus theme. `transparent_dark` blends with
 * the site background; `light` is the embed's own default.
 */
export function giscusTheme(isDark: boolean): GiscusTheme {
  return isDark ? 'transparent_dark' : 'light'
}

/**
 * The dataset the official client script reads from `document.currentScript`.
 * Assign the entries to `script.dataset` before appending: camelCase keys map
 * to the `data-*` attributes the script expects (`repoId` -> `data-repo-id`).
 */
export function giscusEmbedAttributes(
  theme: GiscusTheme,
): Record<string, string> {
  return {
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
    theme,
  }
}

/**
 * Message the widget iframe understands for live updates without reloading
 * (https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md).
 */
export function giscusSetConfigMessage(theme: GiscusTheme) {
  return { giscus: { setConfig: { theme } } }
}

/**
 * Rewrites the `theme` query parameter of an embed URL. While the lazy iframe
 * is still booting, setConfig messages are dropped because the embed has not
 * attached its listener yet; the URL is read at boot, so this is the reliable
 * way to apply a theme chosen before the iframe finished loading.
 */
export function giscusThemeUrl(src: string, theme: GiscusTheme): string {
  const url = new URL(src)
  url.searchParams.set('theme', theme)
  return url.href
}
