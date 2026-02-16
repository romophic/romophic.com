import type { D3GraphNode, D3GraphLink } from '@/types'

export interface GraphData {
    nodes: D3GraphNode[]
    links: D3GraphLink[]
}

export interface GraphThemeColors {
    background: string
    nodeDefault: string
    nodeTag: string
    link: string
    linkHighlight: string
    grid: string
    glowIntensity: number
    glowIntensityHover: number
}
