/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const __dirname = new URL('.', import.meta.url).pathname
// On Windows, the pathname from URL might have a leading slash, e.g. /C:/path
// Let's use a more robust way to get root dir
const srcDir = path.resolve(process.cwd(), 'src')

function findAstroFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      findAstroFiles(filePath, fileList)
    } else if (filePath.endsWith('.astro')) {
      fileList.push(filePath)
    }
  }
  return fileList
}

describe('Architecture Constraints', () => {
  test('No Astro components should define their own HTML shell except BaseLayout.astro', () => {
    const componentsDir = path.join(srcDir, 'components')
    const pagesDir = path.join(srcDir, 'pages')
    const layoutsDir = path.join(srcDir, 'layouts')

    const allAstroFiles = [
      ...findAstroFiles(componentsDir),
      ...findAstroFiles(pagesDir),
      ...findAstroFiles(layoutsDir),
    ]

    for (const filePath of allAstroFiles) {
      if (filePath.endsWith('BaseLayout.astro')) continue

      const content = fs.readFileSync(filePath, 'utf-8').toLowerCase()

      const hasDoctype = content.includes('<!doctype html>')
      const hasHtmlTag = /<html[\s>]/i.test(content)

      if (hasDoctype || hasHtmlTag) {
        throw new Error(
          `Architecture Violation: ${filePath} defines an HTML shell.\n` +
            `Pages and components must use <BaseLayout> or <Layout> instead of defining <html> directly.`,
        )
      }
    }

    expect(true).toBe(true)
  })
})
