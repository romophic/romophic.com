import {
  autoUpdate,
  arrow,
  flip,
  offset,
  shift,
  useFloating,
  FloatingPortal,
} from '@floating-ui/react'
import { useRef, useState, useEffect } from 'react'

export function GlobalLinkPreviews() {
  const [isOpen, setIsOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{
    title: string
    description?: string
    image?: string
  } | null>(null)
  const arrowRef = useRef(null)

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
    placement: 'top',
  })

  // We need to manage "virtual" reference or just manually set the reference
  // Since we are not using the hook's returned refs.setReference on a specific element in render,
  // we must call it manually when hover happens.

  // Use ref to track active link without triggering re-effects
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      const isInternal =
        href.startsWith('/') || href.startsWith(window.location.origin)
      if (!isInternal) return

      if (
        href.startsWith('#') ||
        (href.includes('#') && href.split('#')[0] === window.location.pathname)
      )
        return

      if (!target.closest('[data-pagefind-body]')) return

      // Update state and ref
      activeLinkRef.current = target as HTMLAnchorElement

      // Floating UI reference
      refs.setReference(target)
      setIsOpen(true)

      fetchMetadata(href)
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      // Compare with ref current value
      if (target && target === activeLinkRef.current) {
        setIsOpen(false)
        activeLinkRef.current = null
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [refs])

  // Custom metadata fetcher
  interface PreviewData {
    title: string
    description?: string
    image?: string
  }

  const cache = useRef<Record<string, PreviewData>>({})
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchMetadata = async (url: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    if (cache.current[url]) {
      setPreviewData(cache.current[url])
      return
    }

    try {
      // Add trailing slash prevention or handling
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      })
      const text = await response.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/html')

      const title = doc.querySelector('title')?.innerText || ''
      const description =
        doc
          .querySelector('meta[name="description"]')
          ?.getAttribute('content') || undefined
      const image =
        doc
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content') || undefined

      const data: PreviewData = { title, description, image }
      cache.current[url] = data
      setPreviewData(data)
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error('Failed to fetch preview', e)
      }
    }
  }

  // Close when moving mouse out of link AND not into floating
  // This requires more complex event handling.
  // Let's rely on simplified behavior:
  // If mouse leaves link, close after short delay. If mouse enters floating, cancel close.

  if (!isOpen || !previewData) return null

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="bg-popover text-popover-foreground animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 zoom-in-95 z-50 w-80 rounded-xl border p-4 shadow-lg outline-none"
      >
        {previewData.image && (
          <img
            src={previewData.image}
            alt="Preview"
            className="mb-3 aspect-video w-full rounded-md object-cover"
          />
        )}
        <h4 className="flex items-center gap-2 text-sm leading-none font-semibold tracking-tight">
          {previewData.title}
        </h4>
        {previewData.description && (
          <p className="text-muted-foreground mt-2 line-clamp-3 text-xs">
            {previewData.description}
          </p>
        )}
      </div>
    </FloatingPortal>
  )
}
