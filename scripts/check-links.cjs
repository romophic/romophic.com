/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
const fs = require('fs')
const path = require('path')

const contentDir = path.join(process.cwd(), 'src/content/blog')
const files = []

function walk(dir) {
  if (!fs.existsSync(dir)) return
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      walk(fullPath)
    } else if (item.isFile()) {
      // Include all files to check for images
      files.push(fullPath)
    }
  }
}

walk(contentDir)

const validIds = new Set()
const fileToId = new Map()

files.forEach((file) => {
  const relPath = path.relative(contentDir, file)
  // ID for markdown files usually drops extension, but for images it keeps it.
  // We'll store both normalized ID (no ext for md) and full path.
  const normalizedPath = relPath.split(path.sep).join('/')
  validIds.add(normalizedPath)

  if (file.endsWith('.md') || file.endsWith('.mdx')) {
    const idNoExt = normalizedPath.replace(/\.(mdx?)$/, '')
    validIds.add(idNoExt)
    fileToId.set(file, idNoExt)
  }
})

let errors = 0

files.forEach((file) => {
  if (!file.endsWith('.md') && !file.endsWith('.mdx')) return

  const content = fs.readFileSync(file, 'utf8')
  const sourceId = fileToId.get(file) // This is like 'romophic-library/lib/directed-graph'

  const regex = /\[.*?\]\((.*?)\)/g
  let match
  while ((match = regex.exec(content)) !== null) {
    let rawUrl = match[1]

    // Heuristic to ignore code snippets captured as links
    // e.g. [](int a, int b) or [](auto &x)
    // URLs shouldn't have raw spaces, <, >, {, }, ;
    if (/[\s<>{};]/.test(rawUrl)) continue

    let url = rawUrl.split('#')[0].split('?')[0]
    if (
      !url ||
      url.startsWith('http') ||
      url.startsWith('mailto:') ||
      url.startsWith('//')
    )
      continue

    // Decode URL
    try {
      url = decodeURIComponent(url)
    } catch (e) {
      // ignore
    }

    let targetId = null

    if (url.startsWith('/blog/')) {
      targetId = url.replace('/blog/', '')
    } else if (url.startsWith('/')) {
      continue
    } else {
      // Relative path
      // sourceId is a file path relative to content root (without extension)
      // If the file is 'romophic-library/index', sourceId is 'romophic-library/index'
      // dirname is 'romophic-library'
      const dir = path.dirname(sourceId)

      // Resolve relative path
      // We simulate resolution by using a fake base
      try {
        // Encode dir to handle Japanese characters in path during URL construction
        // But URL constructor expects encoded parts if we strictly follow spec?
        // Actually, in Node, file URLs can handle unicode.
        // Let's stick to string manipulation for relative paths to avoid complexity

        // Simple join for ../ handling
        // Split by /
        const dirParts = dir === '.' ? [] : dir.split('/')
        const urlParts = url.split('/')

        for (const part of urlParts) {
          if (part === '.') continue
          if (part === '..') {
            dirParts.pop()
          } else {
            dirParts.push(part)
          }
        }
        targetId = dirParts.join('/')
      } catch (e) {
        console.error(`Error resolving URL: ${url} in ${sourceId}`)
        errors++
        continue
      }
    }

    targetId = targetId.replace(/\/$/, '')

    // Check existence
    // 1. As a post ID (no extension)
    if (validIds.has(targetId)) continue
    // 2. As a file path (with extension? we don't know ext, so check exact match from set)
    //    Actually validIds contains full paths like 'palimpsest/img/2025_09_03.webp'
    if (validIds.has(targetId)) continue
    // 3. /index variant
    if (validIds.has(targetId + '/index')) continue

    console.error(
      `Link broken in ${sourceId}: ${match[0]} -> (Target: ${targetId})`,
    )
    errors++
  }
})

if (errors > 0) {
  console.error(`Found ${errors} broken links.`)
  process.exit(1)
} else {
  console.log('All internal links look good!')
}
