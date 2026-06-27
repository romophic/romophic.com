import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import TechBadge from './TechBadge.astro'

describe('TechBadge.astro (Test as Documentation)', () => {
  it('renders known tech badge with icon and custom color class', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(TechBadge, {
      props: { tech: 'TypeScript' },
    })

    expect(html).toContain('TypeScript')
    expect(html).toContain('rounded-full')
  })

  it('renders unknown tech badge with fallback default styles', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(TechBadge, {
      props: { tech: 'UnknownSuperTech' },
    })

    expect(html).toContain('UnknownSuperTech')
    expect(html).toContain('bg-primary/5')
  })
})
