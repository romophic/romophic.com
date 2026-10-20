import { defineConfig, fontProviders } from 'astro/config'

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import icon from 'astro-icon'
import pagefind from 'astro-pagefind'
import astroExpressiveCode from 'astro-expressive-code'
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://romophic.com',
  fonts: [
    {
      provider: fontProviders.npm(),
      name: 'Noto Sans JP Variable',
      cssVariable: '--font-noto-sans-jp',
      options: {
        package: '@fontsource-variable/noto-sans-jp',
      },
      // The metric-matched fallback Astro generates for this CJK font scales
      // the local sans-serif (Arial) to ~197%: text renders huge until the
      // woff2 swaps in. Use the plain fallback instead.
      optimizedFallbacks: false,
    },
  ],
  prefetch: {
    defaultStrategy: 'hover',
  },
  integrations: [
    astroExpressiveCode({
      themes: ['github-light', 'github-dark'],
      plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `.${theme.type}`,
      styleOverrides: {
        borderRadius: '0.5rem',
        codeFontFamily: 'var(--font-mono)',
        uiFontFamily: 'var(--font-sans)',
      },
    }),
    mdx(),
    sitemap(),
    icon(),
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 1234,
    host: true,
  },
  devToolbar: {
    enabled: true,
  },
  security: {
    checkOrigin: true,
  },
  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['nofollow', 'noreferrer', 'noopener'],
          },
        ],
        rehypeHeadingIds,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'prepend',
            properties: {
              className: ['anchor-link'],
              ariaHidden: true,
              tabIndex: -1,
            },
            content: {
              type: 'text',
              value: '#',
            },
          },
        ],
        [
          rehypeKatex,
          {
            output: 'htmlAndMathml',
            throwOnError: false,
          },
        ],
      ],
      remarkPlugins: [remarkMath, remarkEmoji],
    }),
  },
})
