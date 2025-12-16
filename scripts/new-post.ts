import fs from 'node:fs'
import path from 'node:path'
import prompts from 'prompts'

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')

async function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog directory not found: ${BLOG_DIR}`)
    process.exit(1)
  }

  // Get existing subdirectories
  const subdirs = fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const response = await prompts([
    {
      type: 'text',
      name: 'title',
      message: 'Post Title:',
      validate: (value) => (value.length > 0 ? true : 'Title is required'),
    },
    {
      type: 'text',
      name: 'slug',
      message: 'Slug (file name without extension):',
      initial: (prev) =>
        prev
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      validate: (value) =>
        /^[a-z0-9-_]+$/.test(value) ? true : 'Invalid slug format',
    },
    {
      type: 'text',
      name: 'description',
      message: 'Description:',
    },
    {
      type: 'text',
      name: 'tags',
      message: 'Tags (comma separated):',
    },
    {
      type: 'select',
      name: 'directory',
      message: 'Where to create the post?',
      choices: [
        { title: 'Root (src/content/blog/)', value: '.' },
        ...subdirs.map((dir) => ({ title: dir, value: dir })),
        { title: 'Create new folder...', value: '__NEW__' },
      ],
    },
    {
      type: (prev) => (prev === '__NEW__' ? 'text' : null),
      name: 'newDirectory',
      message: 'New folder name:',
      validate: (value) =>
        /^[a-z0-9-_]+$/.test(value) ? true : 'Invalid folder name',
    },
  ])

  if (!response.title) return // Cancelled

  const targetDirName =
    response.directory === '__NEW__'
      ? response.newDirectory
      : response.directory
  const targetDir = path.join(BLOG_DIR, targetDirName)

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  const filePath = path.join(targetDir, `${response.slug}.mdx`)

  if (fs.existsSync(filePath)) {
    console.error(`File already exists: ${filePath}`)
    process.exit(1)
  }

  const date = new Date().toISOString().split('T')[0]
  const tags = response.tags
    ? response.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0)
    : []

  // JSON.stringify will format tags array correctly for frontmatter
  // But standard YAML array format is better for readability
  // We can construct it manually or use JSON.stringify

  const tagsLine =
    tags.length > 0 ? `tags: ${JSON.stringify(tags)}` : 'tags: []'

  const content = `---
title: "${response.title}"
description: "${response.description}"
date: ${date}
${tagsLine}
---

Write your content here...
`

  fs.writeFileSync(filePath, content)
  console.log(`✨ Created new post: ${filePath}`)
}

main().catch(console.error)
