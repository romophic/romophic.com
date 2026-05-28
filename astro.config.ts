import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import icon from 'astro-icon'
import pagefind from 'astro-pagefind'
import astroExpressiveCode from 'astro-expressive-code'
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs'
import { remarkExtractLinks } from './src/plugins/remark-extract-links.mjs'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://romophic.com',
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
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
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
    remarkPlugins: [
      remarkMath,
      remarkEmoji,
      remarkReadingTime,
      remarkExtractLinks,
    ],
  },
})
