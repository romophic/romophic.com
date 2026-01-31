import { READING_SPEED_WPM, SITE } from '@/consts'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { SITE } from '@/consts'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat(SITE.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}



export function getHeadingMargin(depth: number): string {
  const margins: Record<number, string> = {
    3: 'ml-4',
    4: 'ml-8',
    5: 'ml-12',
    6: 'ml-16',
  }
  return margins[depth] || ''
}
