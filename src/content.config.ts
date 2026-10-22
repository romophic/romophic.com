import { glob } from 'astro/loaders'
import { defineCollection, reference } from 'astro:content'
import { z } from 'astro/zod'

const httpUrl = z.url().refine(
  (value) => {
    try {
      return /^https?:$/.test(new URL(value).protocol)
    } catch {
      return false
    }
  },
  {
    message: 'URL must use http or https',
  },
)

const validDate = z
  .coerce.date()
  .refine((value) => !Number.isNaN(value.getTime()), {
    message: 'Invalid date',
  })

const blog = defineCollection({
  loader: glob({
    pattern: ['**/*.{md,mdx}', '!**/_*'],
    base: './src/content/blog',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: validDate,
      parent: reference('blog').optional(),
      order: z.number().optional(),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(reference('authors')).optional(),
      draft: z.boolean().default(false),
      updatedDate: validDate.optional(),
    }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    pronouns: z.string().optional(),
    avatar: httpUrl.or(z.string().startsWith('/')),
    bio: z.string().optional(),
    mail: z.email().optional(),
    website: httpUrl.optional(),
    twitter: httpUrl.optional(),
    github: httpUrl.optional(),
    linkedin: httpUrl.optional(),
    discord: httpUrl.optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),

      tags: z.array(z.string()),
      image: image(),
      link: httpUrl,
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }),
})

export const collections = { blog, authors, projects }
