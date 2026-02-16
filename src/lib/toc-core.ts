/**
 * Shared TOC (Table of Contents) core logic.
 *
 * Provides heading region building, visible heading detection,
 * and scroll-to-active utilities used by both the desktop TOCSidebar
 * and the mobile TOCHeader Web Component.
 */

export type HeadingRegion = {
    id: string
    start: number
    end: number
}

const HEADING_SELECTOR = '.prose h2, .prose h3, .prose h4, .prose h5, .prose h6'

/**
 * Query all prose headings from the DOM and build an array of regions.
 * Each region represents a heading's "area" on the page, from its offset
 * to the next heading's offset (or the end of the document).
 */
export function buildHeadingRegions(): {
    headings: HTMLElement[]
    regions: HeadingRegion[]
} {
    const headings = Array.from(
        document.querySelectorAll<HTMLElement>(HEADING_SELECTOR),
    )

    if (headings.length === 0) {
        return { headings: [], regions: [] }
    }

    const regions = headings.map((heading, index) => {
        const nextHeading = headings[index + 1]
        return {
            id: heading.id,
            start: heading.offsetTop,
            end: nextHeading ? nextHeading.offsetTop : document.body.scrollHeight,
        }
    })

    return { headings, regions }
}

/**
 * Determine which heading IDs are currently visible in the viewport.
 * Uses both direct heading visibility and region overlap detection.
 */
export function getVisibleHeadingIds(
    headings: HTMLElement[],
    regions: HeadingRegion[],
    headerOffset: number,
): string[] {
    if (headings.length === 0) return []

    const viewportTop = window.scrollY + headerOffset
    const viewportBottom = window.scrollY + window.innerHeight
    const visibleIds = new Set<string>()

    const isInViewport = (top: number, bottom: number) =>
        (top >= viewportTop && top <= viewportBottom) ||
        (bottom >= viewportTop && bottom <= viewportBottom) ||
        (top <= viewportTop && bottom >= viewportBottom)

    headings.forEach((heading) => {
        const headingBottom = heading.offsetTop + heading.offsetHeight
        if (isInViewport(heading.offsetTop, headingBottom)) {
            visibleIds.add(heading.id)
        }
    })

    regions.forEach((region) => {
        if (region.start <= viewportBottom && region.end >= viewportTop) {
            const heading = document.getElementById(region.id)
            if (heading) {
                const headingBottom = heading.offsetTop + heading.offsetHeight
                if (
                    region.end > headingBottom &&
                    (headingBottom < viewportBottom || viewportTop < region.end)
                ) {
                    visibleIds.add(region.id)
                }
            }
        }
    })

    return Array.from(visibleIds)
}

/**
 * Scroll a container so the given target element is centered vertically.
 * Only scrolls if the distance exceeds the given threshold.
 */
export function scrollToCenter(
    scrollContainer: HTMLElement,
    targetElement: Element,
    threshold = 5,
) {
    const { top: containerTop, height: containerHeight } =
        scrollContainer.getBoundingClientRect()
    const { top: itemTop, height: itemHeight } =
        targetElement.getBoundingClientRect()

    const currentItemTop = itemTop - containerTop + scrollContainer.scrollTop
    const targetScroll = Math.max(
        0,
        Math.min(
            currentItemTop - (containerHeight - itemHeight) / 2,
            scrollContainer.scrollHeight - scrollContainer.clientHeight,
        ),
    )

    if (Math.abs(targetScroll - scrollContainer.scrollTop) > threshold) {
        scrollContainer.scrollTop = targetScroll
    }
}

/**
 * Update scroll mask classes on an element based on scroll position.
 * Shows top/bottom masks when content is scrollable in that direction.
 */
export function updateScrollMaskClasses(
    scrollContainer: HTMLElement,
    maskTarget: HTMLElement,
    options: {
        topClass?: string
        bottomClass?: string
        threshold?: number
    } = {},
) {
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
 * Compare two string arrays for equality (used for active heading diffing).
 */
export function headingIdsChanged(
    oldIds: string[],
    newIds: string[],
): boolean {
    if (oldIds.length !== newIds.length) return true
    return oldIds.some((id, i) => id !== newIds[i])
}
