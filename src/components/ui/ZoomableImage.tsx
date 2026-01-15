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
      className={cn('relative grid overflow-hidden', className)}
      style={style}
    >
      {/* Placeholder: Absolute to fill container, renders behind Zoom */}
      {placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            'col-start-1 row-start-1 h-full w-full object-cover transition-opacity duration-700 ease-out',
            // Scale up to hide blur edges
            'scale-110 blur-xl',
            isLoaded ? 'opacity-0' : 'opacity-100',
          )}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Main Image: Defines layout size */}
      <div className="z-10 col-start-1 row-start-1 h-auto w-full">
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
            className={cn(
              'h-auto w-full transition-opacity duration-500 ease-in',
              isLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        </Zoom>
      </div>
    </div>
  )
}
