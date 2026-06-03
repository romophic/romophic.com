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
