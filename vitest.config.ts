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
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 92,
        statements: 92,
        functions: 95,
        branches: 85,
      },
    },
    // globals: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)
