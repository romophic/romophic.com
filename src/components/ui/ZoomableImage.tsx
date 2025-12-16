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
    <div className={cn('relative overflow-hidden', className)} style={style}>
      {placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            'absolute top-0 left-0 h-full w-full object-cover transition-opacity duration-500 ease-out',
            isLoaded ? 'opacity-0' : 'opacity-100',
          )}
          style={{
            filter: 'blur(20px)',
            transform: 'scale(1.1)', // Prevent blur edges
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <div className="relative z-10">
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
