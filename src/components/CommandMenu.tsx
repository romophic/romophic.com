import { useEffect, useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command'

import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface Props {
  posts: {
    id: string
    title: string
    description: string
    slug: string
  }[]
}

interface PagefindSubResult {
  title: string
  url: string
  excerpt: string
}

interface PagefindResult {
  id: string
  url: string
  meta: {
    title: string
  }
  excerpt: string
  sub_results: PagefindSubResult[]
}

export function CommandMenu({ posts: initialPosts = [] }: Partial<Props>) {
  const [open, setOpen] = useState(false)
  const [posts] = useState<Props['posts']>(initialPosts)
  const [query, setQuery] = useState('')
  const [pagefindResults, setPagefindResults] = useState<PagefindResult[]>([])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Expose a global toggle function for the button in Header
  useEffect(() => {
    window.toggleCommandMenu = () => setOpen((open) => !open)
    return () => {
      delete window.toggleCommandMenu
    }
  }, [])

  // Pagefind Search
  useEffect(() => {
    async function search() {
      if (!query) {
        setPagefindResults([])
        return
      }
      try {
        const pagefindUrl = '/pagefind/pagefind.js'
        const pagefind = await import(/* @vite-ignore */ pagefindUrl)
        await pagefind.options({ showSubResults: true })
        const search = await pagefind.search(query)
        const results = await Promise.all(
          search.results
            .slice(0, 5)
            .map((r: { data: () => Promise<PagefindResult> }) => r.data()),
        )
        setPagefindResults(results)
      } catch {
        // Pagefind not available (dev mode)
      }
    }
    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [query])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle asChild>
          <VisuallyHidden>Command Menu</VisuallyHidden>
        </DialogTitle>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <CommandInput
            placeholder="Type a command or search..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {!query && (
              <CommandGroup heading="Suggestions">
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    window.location.href = '/'
                  }}
                >
                  Home
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    window.location.href = '/blog'
                  }}
                >
                  Blog
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    window.location.href = '/projects'
                  }}
                >
                  Projects
                </CommandItem>
              </CommandGroup>
            )}

            {pagefindResults.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Search Results">
                  {pagefindResults.map((result) => (
                    <CommandItem
                      key={result.url}
                      onSelect={() => {
                        setOpen(false)
                        window.location.href = result.url
                      }}
                      className="items-start"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{result.meta.title}</span>
                        <span
                          className="text-muted-foreground line-clamp-2 text-xs [&>mark]:bg-yellow-200 [&>mark]:text-black dark:[&>mark]:bg-yellow-800 dark:[&>mark]:text-white"
                          dangerouslySetInnerHTML={{ __html: result.excerpt }}
                        />
                        {result.sub_results && result.sub_results.length > 0 && (
                          <div className="mt-1 flex flex-col gap-1 border-l-2 pl-2">
                            {result.sub_results.slice(0, 3).map((sub) => (
                              <div key={sub.url} className="text-xs">
                                <span className="font-medium opacity-80">
                                  {sub.title}
                                </span>
                                <span className="text-muted-foreground mx-1">
                                  &mdash;
                                </span>
                                <span
                                  className="text-muted-foreground inline [&>mark]:bg-yellow-200 [&>mark]:text-black dark:[&>mark]:bg-yellow-800 dark:[&>mark]:text-white"
                                  dangerouslySetInnerHTML={{
                                    __html: sub.excerpt,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {!query && posts.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Recent Posts">
                  {posts.map((post) => (
                    <CommandItem
                      key={post.id}
                      onSelect={() => {
                        setOpen(false)
                        window.location.href = `/blog/${post.slug}`
                      }}
                    >
                      <span className="truncate">{post.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
