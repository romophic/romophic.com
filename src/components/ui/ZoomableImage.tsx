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
  const imgRef = useRef<HTMLImageElement>(null)

  return (
    <div className={cn('relative overflow-hidden', className)} style={style}>
      {/* Placeholder removed to fix double image issue
      {placeholderSrc && (
        <img ... />
      )} 
      */}
      <div className="relative z-10">
        <Zoom>
          <img
            ref={imgRef}
            alt={alt}
            src={src}
            {...props}
            className="h-auto w-full" 
          />
        </Zoom>
      </div>
    </div>
  )
}
