import type { CollectionEntry } from 'astro:content'

export type Site = {
  title: string
  description: string
  href: string
  author: string
  locale: string
  featuredPostCount: number
  postsPerPage: number
}

export type SocialLink = {
  href: string
  label: string
}

export type IconMap = {
  [key: string]: string
}

export type Author = {
  id: string
  name: string
  avatar: string
  isRegistered: boolean
}

export type TOCHeading = {
  slug: string
  text: string
  depth: number
  isSubpostTitle?: boolean
}

export type TOCSection = {
  type: 'parent' | 'subpost'
  title: string
  headings: TOCHeading[]
  subpostId?: string
}

export type AdjacentPosts = {
  newer: CollectionEntry<'blog'> | null
  older: CollectionEntry<'blog'> | null
  parent: CollectionEntry<'blog'> | null
}

export type PostPageData = {
  authors: Author[]
  isCurrentSubpost: boolean
  navigation: AdjacentPosts
  parentPost: CollectionEntry<'blog'> | null
  hasChildPosts: boolean
  subpostCount: number
  postReadingTime: string
  combinedReadingTime: string | null
  tocSections: TOCSection[]
  backlinks: CollectionEntry<'blog'>[]
}
