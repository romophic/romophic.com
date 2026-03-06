export const languages = {
  ja: '日本語',
  en: 'English',
} as const

export const defaultLang = 'ja'

export type UiType = Record<string, string>

export const ui = {
  ja: {
    'nav.home': 'home',
    'nav.blog': 'blog',
    'nav.about': 'about',
    'footer.connect': 'Connect',
    'hero.title': "Hello, I'm {author}.",
    'hero.subtitle':
      '',
    'hero.readBlog': 'ブログを読む',
    'about.title': 'About',
    'about.intro':
      '',
    'about.experience': 'Experience',
    'about.techStack': 'Tech Stack',
    'about.connect': 'Connect',
    'about.projects': 'Projects',
    'search.placeholder': '検索...',
  },
  en: {
    'nav.blog': 'blog',
    'nav.about': 'about',
    'footer.connect': 'Connect',
    'hero.title': "Hello, I'm {author}.",
    'hero.subtitle':
      '',
    'hero.readBlog': 'Read Blog',
    'about.title': 'About',
    'about.intro':
      '',
    'about.experience': 'Experience',
    'about.techStack': 'Tech Stack',
    'about.connect': 'Connect',
    'about.projects': 'Projects',
    'search.placeholder': 'Search...',
  },
} as const satisfies Record<keyof typeof languages, UiType>
