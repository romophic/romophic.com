import {
  buildHeadingRegions,
  getVisibleHeadingIds,
  headingIdsChanged,
  scrollToCenter,
  updateScrollMaskClasses,
  type HeadingRegion,
} from './toc-core'

const HEADER_OFFSET = 150

class TOCState {
  links: NodeListOf<Element> = document.querySelectorAll('[data-heading-link]')
  activeIds: string[] = []
  headings: HTMLElement[] = []
  regions: HeadingRegion[] = []
  scrollArea: HTMLElement | null = null
  tocScrollArea: HTMLElement | null = null
  ticking: boolean = false

  reset() {
    this.links = document.querySelectorAll(
      '#toc-sidebar-container [data-heading-link]',
    )
    this.activeIds = []
    this.headings = []
    this.regions = []
    const tocContainer = document.getElementById('toc-sidebar-container')
    this.scrollArea =
      tocContainer?.querySelector('[data-radix-scroll-area-viewport]') || null
    this.tocScrollArea =
      tocContainer?.querySelector('[data-toc-scroll-area]') || null
  }

  buildRegions() {
    const result = buildHeadingRegions()
    this.headings = result.headings
    this.regions = result.regions
  }

  getVisibleIds(): string[] {
    return getVisibleHeadingIds(this.headings, this.regions, HEADER_OFFSET)
  }
}

const state = new TOCState()

class TOCScrollMask {
  static update() {
    if (!state.scrollArea || !state.tocScrollArea) return
    updateScrollMaskClasses(state.scrollArea, state.tocScrollArea)
  }
}

class TOCLinks {
  static update(headingIds: string[]) {
    state.links.forEach((link) => {
      link.classList.remove('text-foreground')
    })

    headingIds.forEach((id) => {
      if (id) {
        const activeLink = document.querySelector(
          `#toc-sidebar-container [data-heading-link="${id}"]`,
        )
        if (activeLink) {
          activeLink.classList.add('text-foreground')
        }
      }
    })

    this.scrollToActive(headingIds)
  }

  static scrollToActive(headingIds: string[]) {
    if (!state.scrollArea || !headingIds.length) return

    const activeLink = document.querySelector(
      `#toc-sidebar-container [data-heading-link="${headingIds[0]}"]`,
    )
    if (!activeLink) return

    scrollToCenter(state.scrollArea, activeLink)
  }
}

export class TOCController {
  static handleScroll = () => {
    if (state.ticking) return
    state.ticking = true

    requestAnimationFrame(() => {
      const newActiveIds = state.getVisibleIds()

      if (headingIdsChanged(state.activeIds, newActiveIds)) {
        state.activeIds = newActiveIds
        TOCLinks.update(state.activeIds)
      }
      state.ticking = false
    })
  }

  static handleTOCScroll = () => TOCScrollMask.update()

  static handleResize = () => {
    state.buildRegions()
    const newActiveIds = state.getVisibleIds()

    if (headingIdsChanged(state.activeIds, newActiveIds)) {
      state.activeIds = newActiveIds
      TOCLinks.update(state.activeIds)
    }

    TOCScrollMask.update()
  }

  static init() {
    state.reset()
    state.buildRegions()

    if (state.headings.length === 0) {
      TOCLinks.update([])
      return
    }

    this.handleScroll()
    setTimeout(TOCScrollMask.update, 100)

    const options = { passive: true }
    window.addEventListener('scroll', this.handleScroll, options)
    window.addEventListener('resize', this.handleResize, options)
    state.scrollArea?.addEventListener('scroll', this.handleTOCScroll, options)
  }

  static cleanup() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
    state.scrollArea?.removeEventListener('scroll', this.handleTOCScroll)

    Object.assign(state, {
      activeIds: [],
      headings: [],
      regions: [],
      scrollArea: null,
      tocScrollArea: null,
    })
  }
}
