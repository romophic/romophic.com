import { visit } from 'unist-util-visit'

export function remarkExtractLinks() {
  return function (tree, { data }) {
    const internalLinks = []
    
    visit(tree, 'link', (node) => {
      const url = node.url
      if (url) {
        internalLinks.push(url)
      }
    })
    
    data.astro.frontmatter.rawInternalLinks = internalLinks
  }
}
