/**
 * Updates scroll mask CSS classes on a target element based on scroll position.
 * Used to show/hide gradient masks at the top and bottom of scroll containers.
 */
export function updateScrollMaskClasses(
  scrollContainer: HTMLElement,
  maskTarget: HTMLElement,
  options: {
    topClass?: string
    bottomClass?: string
    threshold?: number
  } = {},
): void {
  const {
    topClass = 'mask-t-from-90%',
    bottomClass = 'mask-b-from-90%',
    threshold = 5,
  } = options
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer
  const isAtTop = scrollTop <= threshold
  const isAtBottom = scrollTop >= scrollHeight - clientHeight - threshold
  maskTarget.classList.toggle(topClass, !isAtTop)
  maskTarget.classList.toggle(bottomClass, !isAtBottom)
}

/**
 * Scrolls a container so that the target element is centered within it.
 */
export function scrollToCenter(
  scrollContainer: HTMLElement,
  targetElement: HTMLElement,
): void {
  const containerRect = scrollContainer.getBoundingClientRect()
  const targetRect = targetElement.getBoundingClientRect()
  const currentItemTop =
    targetRect.top - containerRect.top + scrollContainer.scrollTop
  const targetScroll = Math.max(
    0,
    Math.min(
      currentItemTop - (containerRect.height - targetRect.height) / 2,
      scrollContainer.scrollHeight - scrollContainer.clientHeight,
    ),
  )
  scrollContainer.scrollTop = targetScroll
}

/**
 * Returns how far the page is scrolled, clamped to the range [0, 1].
 */
export function getPageScrollProgress(): number {
  const doc = document.documentElement
  const scrollableDistance = doc.scrollHeight - doc.clientHeight
  if (scrollableDistance <= 0) return 0
  const scrollTop = window.scrollY || doc.scrollTop || document.body.scrollTop
  return Math.min(Math.max(scrollTop / scrollableDistance, 0), 1)
}

const ACTIVE_HEADING_SELECTOR =
  '.prose h2, .prose h3, .prose h4, .prose h5, .prose h6'
const SPY_ROOT_MARGIN = '-100px 0px -66% 0px'
const ACTIVE_LINK_CLASS = 'text-foreground'

export interface HeadingScrollSpyOptions {
  /** Data attribute TOC links carry, matched against observed heading ids. */
  linkAttribute: string
  /** Scroll container that follows the active link. */
  scrollArea?: HTMLElement | null
  /** Root for link lookups. Defaults to the document. */
  scope?: ParentNode
  /** Runs after a link is marked active (labels, custom state, ...). */
  onActive?: (link: HTMLElement) => void
}

/**
 * Highlights the TOC link whose heading is currently in view and keeps it
 * centered in its scroll container. Returns the observer so callers can
 * disconnect it on teardown.
 */
export function observeActiveHeadings({
  linkAttribute,
  scrollArea,
  scope,
  onActive,
}: HeadingScrollSpyOptions): IntersectionObserver {
  const root: ParentNode = scope ?? document
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const id = entry.target.id
        if (!id) continue

        const link = root.querySelector<HTMLElement>(
          `[${linkAttribute}="${id}"]`,
        )
        if (!link) continue

        root.querySelectorAll(`[${linkAttribute}]`).forEach((el) => {
          el.classList.remove(ACTIVE_LINK_CLASS)
          el.removeAttribute('aria-current')
        })
        link.classList.add(ACTIVE_LINK_CLASS)
        link.setAttribute('aria-current', 'location')
        onActive?.(link)

        if (scrollArea) {
          const top =
            link.offsetTop -
            scrollArea.clientHeight / 2 +
            link.clientHeight / 2
          scrollArea.scrollTo({
            top: Math.max(0, top),
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          })
        }
      }
    },
    { rootMargin: SPY_ROOT_MARGIN },
  )

  document
    .querySelectorAll(ACTIVE_HEADING_SELECTOR)
    .forEach((el) => observer.observe(el))
  return observer
}
