import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Badge, { getBadgeStyles } from './Badge.astro'

describe('Badge.astro (Test as Documentation)', () => {
  it('generates proper style classes for different variants', () => {
    expect(getBadgeStyles({ variant: 'default' })).toContain('bg-primary')
    expect(getBadgeStyles({ variant: 'secondary' })).toContain('bg-secondary')
    expect(getBadgeStyles({ variant: 'destructive' })).toContain('bg-destructive')
    expect(getBadgeStyles({ variant: 'outline' })).toContain('text-foreground')
    expect(getBadgeStyles({ variant: 'muted' })).toContain('bg-primary/5')
  })

  it('renders badge component correctly', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Badge, {
      props: { variant: 'secondary' },
    })

    expect(html).toContain('data-slot="badge"')
    expect(html).toContain('bg-secondary')
  })
})
