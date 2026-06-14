import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, it, expect } from 'vitest'
import Button from './Button.astro'
import { getButtonStyles } from './Button.astro'

describe('button.astro', () => {
  it('renders default button', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      slots: { default: 'Click me' },
    })

    expect(html).toContain('Click me')
    expect(html).toContain('<button')
    expect(html).toContain('bg-primary') // default variant
    expect(html).toContain('h-9') // default size
  })

  it('renders anchor tag when as="a" is passed', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { as: 'a', href: '/test' },
      slots: { default: 'Link' },
    })

    expect(html).toContain('<a')
    expect(html).toContain('href="/test"')
    expect(html).toContain('Link')
  })

  it('applies destructive variant', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { variant: 'destructive' },
    })
    expect(html).toContain('bg-destructive')
  })

  it('applies outline variant', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { variant: 'outline' },
    })
    expect(html).toContain('border bg-background')
  })

  it('applies muted variant', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { variant: 'muted' },
    })
    expect(html).toContain('bg-muted text-foreground')
  })

  it('applies ghost variant', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { variant: 'ghost' },
    })
    expect(html).toContain('hover:bg-muted')
  })

  it('applies link variant', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { variant: 'link' },
    })
    expect(html).toContain('underline-offset-4')
  })

  it('applies sm size', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { size: 'sm' },
    })
    expect(html).toContain('h-8')
  })

  it('applies lg size', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { size: 'lg' },
    })
    expect(html).toContain('h-10')
  })

  it('applies icon size', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { size: 'icon' },
    })
    expect(html).toContain('size-9')
  })

  it('appends custom class', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Button, {
      props: { class: 'custom-class' },
    })
    expect(html).toContain('custom-class')
  })

  describe('getButtonStyles function', () => {
    it('returns default classes when called without arguments', () => {
      const styles = getButtonStyles()
      expect(styles).toContain('bg-primary')
      expect(styles).toContain('h-9')
    })
  })
})
