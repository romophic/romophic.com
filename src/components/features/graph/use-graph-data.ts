import { useEffect, useState } from 'react'
import { GRAPH_CONFIG } from '@/consts'
import type { D3GraphNode, D3GraphLink } from '@/types'
import type { GraphData } from './types'

/**
 * Hook to fetch and process graph data from /graph.json.
 * Deduplicates nodes, computes degree, assigns categories, and initializes positions.
 */
export function useGraphData() {
    const [data, setData] = useState<GraphData | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        fetch('/graph.json')
            .then((res) => res.json())
            .then((fetchedData: { nodes: D3GraphNode[]; links: D3GraphLink[] }) => {
                const seenIds = new Set<string>()
                const nodes: D3GraphNode[] = []

                fetchedData.nodes.forEach((n) => {
                    if (!n.id || seenIds.has(n.id)) return
                    seenIds.add(n.id)
                    nodes.push({ ...n, val: 5, degree: 0 })
                })

                const nodeMap = new Map<string, D3GraphNode>(
                    nodes.map((n) => [n.id, n]),
                )
                const links: D3GraphLink[] = []

                let categoryIdx = 0
                const tagToCategory = new Map<string, number>()

                fetchedData.links.forEach((l) => {
                    const sourceId = typeof l.source === 'object' ? l.source.id : l.source
                    const targetId = typeof l.target === 'object' ? l.target.id : l.target

                    if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
                        links.push(l)
                        const s = nodeMap.get(sourceId)!
                        const t = nodeMap.get(targetId)!
                        s.degree = (s.degree || 0) + 1
                        t.degree = (t.degree || 0) + 1
                    }
                })

                nodes.forEach((n) => {
                    if (n.group === 'tag') {
                        tagToCategory.set(
                            n.id,
                            categoryIdx % GRAPH_CONFIG.theme.palettes.dark.length,
                        )
                        n.category = categoryIdx % GRAPH_CONFIG.theme.palettes.dark.length
                        categoryIdx++
                    }
                })

                // Build node→tag adjacency for O(N) category assignment
                const nodeToTag = new Map<string, string>()
                links.forEach((l) => {
                    const sId = typeof l.source === 'object' ? l.source.id : String(l.source)
                    const tId = typeof l.target === 'object' ? l.target.id : String(l.target)
                    if (nodeMap.get(tId)?.group === 'tag' && !nodeToTag.has(sId)) {
                        nodeToTag.set(sId, tId)
                    } else if (nodeMap.get(sId)?.group === 'tag' && !nodeToTag.has(tId)) {
                        nodeToTag.set(tId, sId)
                    }
                })

                nodes.forEach((n) => {
                    if (n.group === 'post') {
                        const tagId = nodeToTag.get(n.id)
                        if (tagId) {
                            n.category = tagToCategory.get(tagId)
                        }
                    }
                })

                const initialX = 400
                const initialY = 300
                const { initialRadius } = GRAPH_CONFIG.physics
                nodes.forEach((n) => {
                    n.x = initialX + (Math.random() - 0.5) * initialRadius
                    n.y = initialY + (Math.random() - 0.5) * initialRadius
                })

                setData({ nodes, links })
                setTimeout(() => setIsVisible(true), 100)
            })
            .catch((err) => console.error('Failed to load graph data:', err))
    }, [])

    return { data, isVisible }
}

/**
 * Hook to detect dark mode state based on DOM attributes/classes.
 * Observes mutations on the documentElement.
 */
export function useThemeDetection() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const checkTheme = () => {
            const isDarkMode =
                document.documentElement.getAttribute('data-theme') === 'dark' ||
                document.documentElement.classList.contains('dark')
            setIsDark(isDarkMode)
        }
        checkTheme()
        const observer = new MutationObserver(checkTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme'],
        })
        return () => observer.disconnect()
    }, [])

    return isDark
}
