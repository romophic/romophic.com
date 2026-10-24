import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  updateScrollMaskClasses,
  scrollToCenter,
  getPageScrollProgress,
  observeActiveHeadings,
} from './scroll-utils'

function createMockElement() {
  const classes = new Set<string>()
  return {
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }),
    classList: {
      toggle: (cls: string, force?: boolean) => {
        if (force === undefined) {
          if (classes.has(cls)) classes.delete(cls)
          else classes.add(cls)
        } else if (force) {
          classes.add(cls)
        } else {
          classes.delete(cls)
        }
      },
      contains: (cls: string) => classes.has(cls),
    },
  } as unknown as HTMLElement
}

describe('scroll-utils (Test as Documentation)', () => {
  beforeEach(() => {
    globalThis.document = {
      createElement: () => createMockElement(),
    } as never
  })

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>).document
  })

  describe('updateScrollMaskClasses', () => {
    it('toggles top and bottom mask classes depending on scroll position', () => {
      const scrollContainer = {
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 500,
      } as HTMLElement

      const maskTarget = document.createElement('div')

      // At top (scrollTop = 0 <= threshold 5) -> topClass toggled off (!true = false)
      // At bottom -> (0 >= 1000 - 500 - 5 = 495) -> false -> bottomClass toggled on (!false = true)
      updateScrollMaskClasses(scrollContainer, maskTarget)
      expect(maskTarget.classList.contains('mask-t-from-90%')).toBe(false)
      expect(maskTarget.classList.contains('mask-b-from-90%')).toBe(true)

      // Scrolled to middle
      scrollContainer.scrollTop = 250
      updateScrollMaskClasses(scrollContainer, maskTarget)
      expect(maskTarget.classList.contains('mask-t-from-90%')).toBe(true)
      expect(maskTarget.classList.contains('mask-b-from-90%')).toBe(true)

      // Scrolled to bottom
      scrollContainer.scrollTop = 500
      updateScrollMaskClasses(scrollContainer, maskTarget)
      expect(maskTarget.classList.contains('mask-t-from-90%')).toBe(true)
      expect(maskTarget.classList.contains('mask-b-from-90%')).toBe(false)
    })
  })

  describe('scrollToCenter', () => {
    it('adjusts container scrollTop to center target element', () => {
      const scrollContainer = document.createElement('div')
      Object.defineProperty(scrollContainer, 'scrollTop', {
        value: 0,
        writable: true,
      })
      Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000 })
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 400 })
      vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        height: 400,
      } as DOMRect)

      const targetElement = document.createElement('div')
      vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
        top: 300,
        height: 50,
      } as DOMRect)

    scrollToCenter(scrollContainer, targetElement)
    // currentItemTop = 300 - 100 + 0 = 200
    // targetScroll = 200 - (400 - 50) / 2 = 200 - 175 = 25
    expect(scrollContainer.scrollTop).toBe(25)
  })

  describe('getPageScrollProgress', () => {
    function mockPage(scrollTop: number, scrollHeight: number, clientHeight: number) {
      ;(globalThis as unknown as Record<string, unknown>).document = {
        documentElement: { scrollTop, scrollHeight, clientHeight },
        body: { scrollTop: 0 },
      }
      ;(globalThis as unknown as Record<string, unknown>).window = { scrollY: 0 }
    }

    afterEach(() => {
      delete (globalThis as unknown as Record<string, unknown>).document
      delete (globalThis as unknown as Record<string, unknown>).window
    })

    it('returns 0 when the page does not scroll', () => {
      mockPage(0, 800, 800)
      expect(getPageScrollProgress()).toBe(0)
    })

    it('returns the scrolled fraction, clamped to [0, 1]', () => {
      mockPage(250, 1000, 500)
      expect(getPageScrollProgress()).toBe(0.5)

      mockPage(2000, 1000, 500)
      expect(getPageScrollProgress()).toBe(1)
    })
  })

  describe('observeActiveHeadings', () => {
    let observerCallback: IntersectionObserverCallback | null = null
    let observed: Element[] = []

    beforeEach(() => {
      observed = []
      ;(globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
        constructor(cb: IntersectionObserverCallback) {
          observerCallback = cb
        }
        observe(el: Element) {
          observed.push(el)
        }
        disconnect() {}
      }
      ;(globalThis as unknown as Record<string, unknown>).window = {
        matchMedia: () => ({ matches: false }),
      }
      ;(globalThis as unknown as Record<string, unknown>).document = {
        querySelectorAll: () => [{ id: 'intro' }, { id: 'usage' }],
      }
    })

    afterEach(() => {
      delete (globalThis as unknown as Record<string, unknown>).IntersectionObserver
      delete (globalThis as unknown as Record<string, unknown>).window
      delete (globalThis as unknown as Record<string, unknown>).document
    })

    function mockLink(classes = new Set<string>()) {
      const attributes = new Map<string, string>()
      return {
        offsetTop: 100,
        clientHeight: 20,
        classList: {
          add: (c: string) => classes.add(c),
          remove: (c: string) => classes.delete(c),
          contains: (c: string) => classes.has(c),
        },
        setAttribute: (k: string, v: string) => attributes.set(k, v),
        removeAttribute: (k: string) => attributes.delete(k),
        hasAttribute: (k: string) => attributes.has(k),
        getAttributeValue: (k: string) => attributes.get(k),
      } as unknown as HTMLElement
    }

    it('observes prose headings and highlights the link of the visible one', () => {
      const active = mockLink()
      const stale = mockLink((() => {
        const s = new Set(['text-foreground'])
        return s
      })())
      const scope = {
        querySelector: () => active,
        querySelectorAll: () => [active, stale],
      } as unknown as ParentNode
      const scrollTo = vi.fn()
      const scrollArea = {
        clientHeight: 200,
        scrollTo,
      } as unknown as HTMLElement

      const observer = observeActiveHeadings({
        linkAttribute: 'data-heading-link',
        scrollArea,
        scope,
      })

      // Both prose headings got registered with the observer
      expect(observed.map((el) => (el as { id: string }).id)).toEqual([
        'intro',
        'usage',
      ])

      observerCallback?.(
        [{ isIntersecting: true, target: { id: 'intro' } } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )

      expect(active.classList.contains('text-foreground')).toBe(true)
      expect((active as unknown as { getAttributeValue: (k: string) => string | undefined }).getAttributeValue('aria-current')).toBe('location')
      expect(stale.classList.contains('text-foreground')).toBe(false)
      // Centers the link: offsetTop(100) - clientHeight/2(100) + linkHeight/2(10)
      expect(scrollTo).toHaveBeenCalledWith({
        top: 10,
        behavior: 'smooth',
      })
      expect(observer).toBeTruthy()
    })

    it('skips entries without an intersecting heading or a matching link', () => {
      const onActive = vi.fn()
      const scope = {
        querySelector: () => null,
        querySelectorAll: () => [],
      } as unknown as ParentNode

      observeActiveHeadings({ linkAttribute: 'data-heading-id', scope, onActive })

      observerCallback?.(
        [{ isIntersecting: true, target: { id: 'unknown' } } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
      expect(onActive).not.toHaveBeenCalled()
    })
  })
  })
})
