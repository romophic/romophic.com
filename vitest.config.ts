/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    css: false,
    server: {
      deps: {
        inline: [/@pagefind/, /astro-pagefind/],
      },
    },
    // globals: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)
