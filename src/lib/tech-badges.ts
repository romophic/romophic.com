const DEFAULT_BADGE_COLOR = 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20'

export const TECH_BADGES: Record<string, { icon: string; colorClass?: string }> = {
  'C++': { icon: 'simple-icons:cplusplus' },
  Python: { icon: 'simple-icons:python' },
  React: { icon: 'simple-icons:react' },
  'React Native': { icon: 'simple-icons:react' },
  Vue: { icon: 'simple-icons:vuedotjs' },
  'Nuxt.js': { icon: 'simple-icons:nuxtdotjs' },
  Rust: { icon: 'simple-icons:rust' },
  Astro: { icon: 'simple-icons:astro' },
  TypeScript: { icon: 'simple-icons:typescript' },
  JavaScript: { icon: 'simple-icons:javascript' },
  Tailwind: { icon: 'simple-icons:tailwindcss' },
  'Ruby on Rails': { icon: 'simple-icons:rubyonrails' },
  AWS: { icon: 'simple-icons:amazonaws' },
  Docker: { icon: 'simple-icons:docker' },
  'Next.js': { icon: 'simple-icons:nextdotjs' },
}

export function getTechBadge(name: string): { icon: string; colorClass: string } | null {
  const badge = TECH_BADGES[name]
  if (!badge) return null
  return {
    icon: badge.icon,
    colorClass: badge.colorClass || DEFAULT_BADGE_COLOR,
  }
}
