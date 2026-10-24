import { getViteConfig } from 'astro/config'
import type { InlineConfig } from 'vitest/node'

// getViteConfig's own type predates the `test` key, so extend its parameter
// type instead of casting the whole object to `any`.
type AstroVitestConfig = Parameters<typeof getViteConfig>[0] & {
  test: InlineConfig
}

export default getViteConfig({
  test: {
    css: false,
    setupFiles: ['src/test-utils/setup.ts'],
    server: {
      deps: {
        inline: [/@pagefind/, /astro-pagefind/],
      },
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,astro}'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/__mocks__/**',
        'src/env.d.ts',
        'src/types.ts',
        // The glob loaders only execute during astro sync/build, never in
        // tests, so counting them drags function coverage below the gate.
        'src/content.config.ts',
        'src/lib/graph/physics.worker.ts',
      ],
      thresholds: {
        lines: 92,
        statements: 92,
        functions: 95,
        branches: 85,
      },
    },
  },
} as AstroVitestConfig)
