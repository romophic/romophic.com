import { toString } from 'mdast-util-to-string'

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree)
    // 空白文字を除外した実質的な文字数
    const chars = textOnPage.replace(/\s+/g, '').length
    
    // 技術ブログ（日/英混在）の平均的な読書速度（約400文字/分）で計算
    const minutes = Math.max(1, Math.ceil(chars / 400))
    
    data.astro.frontmatter.minutesRead = `${minutes} min read`
  }
}
