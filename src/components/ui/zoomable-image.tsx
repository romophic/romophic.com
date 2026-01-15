import React, { useState, useRef, useEffect } from 'react'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { cn } from '@/lib/utils'

interface ZoomableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string
  src: string
  placeholderSrc?: string
}

export function ZoomableImage({
  alt,
  src,
  placeholderSrc,
  className,
  style,
  ...props
}: ZoomableImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true)
    }
  }, [])

  return (
    <div
      className={cn('relative grid h-fit w-full overflow-hidden', className)}
      style={{ gridTemplateAreas: '"stack"', ...style }}
    >
      {/* Placeholder: Renders behind the main image */}
      {placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            'h-full w-full object-cover transition-opacity duration-1000 ease-out',
            isLoaded ? 'opacity-0' : 'opacity-100',
          )}
          style={{
            gridArea: 'stack',
            filter: 'blur(40px)',
            transform: 'scale(1.2)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main Image Container */}
      <div
        className={cn(
          'h-auto w-full transition-opacity duration-700 ease-in',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
        style={{ gridArea: 'stack' }}
      >
        <Zoom>
          <img
            ref={imgRef}
            alt={alt}
            src={src}
            {...props}
            onLoad={(e) => {
              setIsLoaded(true)
              props.onLoad?.(e)
            }}
            className="h-auto w-full"
          />
        </Zoom>
      </div>
    </div>
  )
}
