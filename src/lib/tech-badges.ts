export const TECH_BADGES: Record<string, { icon: string; colorClass: string }> = {
    'C++': {
        icon: 'simple-icons:cplusplus',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    Python: {
        icon: 'simple-icons:python',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    React: {
        icon: 'simple-icons:react',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    Vue: {
        icon: 'simple-icons:vuedotjs',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    'Nuxt.js': {
        icon: 'simple-icons:nuxtdotjs',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    Rust: {
        icon: 'simple-icons:rust',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    Astro: {
        icon: 'simple-icons:astro',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    TypeScript: {
        icon: 'simple-icons:typescript',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    JavaScript: {
        icon: 'simple-icons:javascript',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    Tailwind: {
        icon: 'simple-icons:tailwindcss',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    'Ruby on Rails': {
        icon: 'simple-icons:rubyonrails',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    AWS: {
        icon: 'simple-icons:amazonaws',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    Docker: {
        icon: 'simple-icons:docker',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },
    'Next.js': {
        icon: 'simple-icons:nextdotjs',
        colorClass: 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20',
    },

}

export function getTechBadge(name: string) {
    return TECH_BADGES[name] || null
}
