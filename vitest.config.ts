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
      include: ['src/**/*.{ts,astro}'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/__mocks__/**',
        'src/env.d.ts',
        'src/types.ts',
        // The glob loaders only execute during astro sync/build, never in
        // tests, so counting them drags function coverage below the gate.
        'src/content.config.ts',
        'src/lib/graph/interaction.ts',
        'src/lib/graph/manager.ts',
        'src/lib/graph/physics.worker.ts',
      ],
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
