/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { updateScrollMaskClasses, scrollToCenter } from './scroll-utils'

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
    } as any
  })

  afterEach(() => {
    delete (globalThis as any).document
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
  })
})
