import { ui, defaultLang } from './ui'

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/')
  if (lang in ui) return lang as keyof typeof ui
  return defaultLang
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(
    key: keyof (typeof ui)[typeof defaultLang],
    ...args: Record<string, string | number>[]
  ) {
    let result: string = ui[lang][key] || ui[defaultLang][key]

    // Simple interpolation for variables like {author} or {title}
    if (args.length > 0 && typeof args[0] === 'object') {
      Object.entries(args[0]).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v))
      })
    }
    return result
  }
}

/**
 * Helper to auto-prepend the locale to internal relative routes if we are in `/en/`.
 * @param path The absolute internal path (e.g. `/blog`)
 * @param lang The current locale
 */
export function localizePath(path: string, lang: keyof typeof ui): string {
  if (lang === defaultLang) return path
  if (path.startsWith(`/${lang}/`)) return path // Already localized
  return `/${lang}${path === '/' ? '' : path}`
}
