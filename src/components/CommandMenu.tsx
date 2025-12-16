import { useEffect, useState } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command'

import { DialogTitle } from './ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface Props {
  posts: {
    id: string
    title: string
    description: string
    slug: string
  }[]
}

export function CommandMenu({ posts: initialPosts = [] }: Partial<Props>) {
  const [open, setOpen] = useState(false)
  const [posts] = useState<Props['posts']>(initialPosts)

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
    // @ts-expect-error: window object extension
    window.toggleCommandMenu = () => setOpen((open) => !open)
    return () => {
      // @ts-expect-error: window object extension
      delete window.toggleCommandMenu
    }
  }, [])

  // Filter posts based on simple search (if we had input state, but CommandInput handles filtering visually)
  // Actually cmdk handles filtering automatically if we provide the text value to CommandItem

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle asChild>
        <VisuallyHidden>Command Menu</VisuallyHidden>
      </DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
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

        {posts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Blog Posts">
              {posts.map((post) => (
                <CommandItem
                  key={post.id}
                  value={post.title} // Used for search filtering
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
    </CommandDialog>
  )
}
