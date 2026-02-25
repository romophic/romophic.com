import type { SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'romophic',
  description:
    'romophic.com is a technical digital garden built with Astro, React, and Tailwind CSS.',
  href: 'https://romophic.com',
  author: 'romophic',
  locale: 'ja-JP',
  featuredPostCount: 2,
  postsPerPage: 20,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/',
    label: 'home',
  },
  {
    href: '/blog',
    label: 'blog',
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
    href: 'mailto:nariyu.pub@gmail.com',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
} as const satisfies Record<string, string>

export const GISCUS_CONFIG = {
  repo: 'romophic/romophic.com',
  repoId: 'R_kgDOQil8lA',
  category: 'Announcements',
  categoryId: 'DIC_kwDOQil8lM4Czpc3',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '0',
  emitMetadata: '0',
  inputPosition: 'bottom',
  lang: 'ja',
  loading: 'lazy',
}

export const GRAPH_CONFIG = {
  physics: {
    linkDistance: 60,
    chargeStrength: -150,
    centerStrength: 0.15,
    collideRadius: 15,
    initialRadius: 10,
    alphaTarget: 0.3,
    velocityDecay: 0.1,
  },
  theme: {
    dark: {
      background: '#1a1a1a',
      nodeDefault: '#e2e8f0',
      nodeTag: '#a855f7',
      link: 'rgba(255, 255, 255, 0.08)',
      linkHighlight: '#fff',
      grid: 'rgba(255, 255, 255, 0.03)',
      glowIntensity: 20,
      glowIntensityHover: 35,
    },
    light: {
      background: '#f8fafc',
      nodeDefault: 'rgba(0, 0, 0, 0.85)',
      nodeTag: '#7e22ce',
      link: 'rgba(0, 0, 0, 0.08)',
      linkHighlight: '#000',
      grid: 'rgba(0, 0, 0, 0.03)',
      glowIntensity: 6,
      glowIntensityHover: 15,
    },
    palettes: {
      dark: [
        '#a855f7',
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#6366f1',
        '#ec4899',
      ],
      light: [
        '#7e22ce',
        '#1d4ed8',
        '#059669',
        '#d97706',
        '#dc2626',
        '#4f46e5',
        '#db2777',
      ],
    },
  },
  interaction: {
    hitRadius: 12,
    zoomExtent: [0.1, 8] as [number, number],
    lodThreshold: 1.2,
    importantDegree: 4,
  },
}

export const ICONS = {
  arrowUp: 'lucide:arrow-up',
  arrowRight: 'lucide:arrow-right',
  arrowLeft: 'lucide:arrow-left',
  bookCopy: 'lucide:book-copy',
  bookOpen: 'lucide:book-open',
  bookOpenText: 'lucide:book-open-text',
  calendar: 'lucide:calendar',
  chevronDown: 'lucide:chevron-down',
  circleHelp: 'lucide:circle-help',
  cornerLeftUp: 'lucide:corner-left-up',
  file: 'lucide:file',
  fileText: 'lucide:file-text',
  github: 'lucide:github',
  hash: 'lucide:hash',
  home: 'lucide:home',
  info: 'lucide:info',
  libraryBig: 'lucide:library-big',
  link: 'lucide:link',
  mail: 'lucide:mail',
  messageCircleQuestion: 'lucide:message-circle-question',
  moon: 'lucide:moon',
  network: 'lucide:share-2',
  rss: 'lucide:rss',
  search: 'lucide:search',
  sun: 'lucide:sun',
  tag: 'lucide:tag',
  tags: 'lucide:tags',
  twitter: 'lucide:twitter',
  user: 'lucide:user',
  users: 'lucide:users',
} as const satisfies Record<string, string>
