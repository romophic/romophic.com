import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'romophic',
  description:
    'romophic.com is a technical digital garden built with Astro, React, and Tailwind CSS.',
  href: 'https://romophic.com',
  author: 'romophic',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/authors',
    label: 'authors',
  },
  {
    href: '/graph',
    label: 'graph',
  },
  {
    href: '/about',
    label: 'about',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/romophic',
    label: 'GitHub',
  },
  {
    href: 'https://twitter.com/romophic',
    label: 'Twitter',
  },
  {
    href: 'mailto:jason@enscribe.dev',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}

export const READING_SPEED_WPM = 200
export const SCROLL_TO_TOP_THRESHOLD = 300

export const ICONS = {
  arrowUp: 'lucide:arrow-up',
  hash: 'lucide:hash',
  fileText: 'lucide:file-text',
  bookOpen: 'lucide:book-open',
  bookOpenText: 'lucide:book-open-text',
  libraryBig: 'lucide:library-big',
  link: 'lucide:link',
  network: 'lucide:share-2',
  user: 'lucide:user',
  users: 'lucide:users',
}
