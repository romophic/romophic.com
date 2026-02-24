export const languages = {
  ja: '日本語',
  en: 'English',
} as const

export const defaultLang = 'ja'

export type UiType = Record<string, string>

export const ui = {
  ja: {
    'nav.blog': 'blog',
    'nav.authors': 'authors',
    'nav.about': 'about',
    'nav.tags': 'tags',
    'footer.connect': 'Connect',
    'hero.title': "Hello, I'm {author}.",
    'hero.subtitle':
      'アルゴリズム、競技プログラミング、ソフトウェアエンジニアリングを愛する開発者です。学んだ知識や思考の軌跡を「デジタルガーデン」として記録・共有しています。',
    'hero.readBlog': 'ブログを読む',
    'about.title': 'About',
    'about.intro':
      '{title} は技術的なデジタルガーデン兼ポートフォリオです。知識の共有、プロジェクトの記録、そしてノードが繋がるようにアイデアを探求するための空間です。',
    'about.experience': 'Experience',
    'about.techStack': 'Tech Stack',
    'about.connect': 'Connect',
    'about.projects': 'Projects',
    'search.placeholder': '検索...',
  },
  en: {
    'nav.blog': 'blog',
    'nav.authors': 'authors',
    'nav.about': 'about',
    'nav.tags': 'tags',
    'footer.connect': 'Connect',
    'hero.title': "Hello, I'm {author}.",
    'hero.subtitle':
      'A developer passionate about algorithms, competitive programming, and software engineering. I build digital gardens to document my journey and share knowledge.',
    'hero.readBlog': 'Read Blog',
    'about.title': 'About',
    'about.intro':
      '{title} is a technical digital garden and personal portfolio. It serves as a space for sharing knowledge, documenting projects, and exploring interconnected ideas.',
    'about.experience': 'Experience',
    'about.techStack': 'Tech Stack',
    'about.connect': 'Connect',
    'about.projects': 'Projects',
    'search.placeholder': 'Search...',
  },
} as const satisfies Record<keyof typeof languages, UiType>
