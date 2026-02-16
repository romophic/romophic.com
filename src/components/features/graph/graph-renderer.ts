import { GRAPH_CONFIG } from '@/consts'
import type { D3GraphNode, D3GraphLink } from '@/types'
import type { GraphThemeColors } from './types'

/** Rendering constants for the graph canvas. */
const RENDER = {
    grid: { size: 50, multiplier: 2 },
    link: { widthDefault: 0.6, widthHighlight: 1.5 },
    arrow: { length: 5, angle: Math.PI / 7, targetOffset: 8 },
    node: {
        radiusTag: 4,
        radiusPost: 6,
        hoverScale: 1.5,
        haloOffset: 6,
    },
    label: {
        fontSize: 12,
        paddingX: 4,
        paddingY: 6,
        height: 18,
        borderRadius: 4,
        textOffsetY: 8,
        importantZoomMin: 0.6,
    },
    halo: {
        tag: 'rgba(168, 85, 247, 0.2)',
        dark: 'rgba(255, 255, 255, 0.15)',
        light: 'rgba(0, 0, 0, 0.05)',
    },
    labelBg: {
        dark: 'rgba(0, 0, 0, 0.75)',
        light: 'rgba(255, 255, 255, 0.85)',
    },
    shadow: { light: 'rgba(0, 0, 0, 0.3)' },
    labelBorder: { color: 'rgba(0, 0, 0, 0.1)', width: 0.5 },
} as const

/**
 * Determine a node's color based on its category and the current theme.
 */
export function getNodeColor(
    node: D3GraphNode,
    isDark: boolean,
    activeTheme: GraphThemeColors,
): string {
    if (node.category !== undefined) {
        const palettes = GRAPH_CONFIG.theme.palettes
        return isDark
            ? palettes.dark[node.category]
            : palettes.light[node.category]
    }
    return activeTheme.nodeDefault
}

/**
 * Draw a small directional arrow at the end of a link.
 */
export function drawArrow(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number,
) {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const tx = x2 - radius * Math.cos(angle)
    const ty = y2 - radius * Math.sin(angle)
    ctx.beginPath()
    ctx.moveTo(tx, ty)
    ctx.lineTo(
        tx - RENDER.arrow.length * Math.cos(angle - RENDER.arrow.angle),
        ty - RENDER.arrow.length * Math.sin(angle - RENDER.arrow.angle),
    )
    ctx.lineTo(
        tx - RENDER.arrow.length * Math.cos(angle + RENDER.arrow.angle),
        ty - RENDER.arrow.length * Math.sin(angle + RENDER.arrow.angle),
    )
    ctx.closePath()
    ctx.fill()
}

/**
 * Render the full graph scene onto a 2D canvas context.
 */
export function renderGraph(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    nodes: D3GraphNode[],
    links: D3GraphLink[],
    transform: { x: number; y: number; k: number },
    isDark: boolean,
    activeTheme: GraphThemeColors,
    hoverNode: D3GraphNode | null,
    neighborIds: ReadonlySet<string>,
) {
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(transform.x, transform.y)
    ctx.scale(transform.k, transform.k)

    // Grid (dark mode only)
    if (isDark) {
        ctx.strokeStyle = activeTheme.grid
        ctx.lineWidth = 1 / transform.k
        const xStart = -width * RENDER.grid.multiplier,
            xEnd = width * RENDER.grid.multiplier,
            yStart = -height * RENDER.grid.multiplier,
            yEnd = height * RENDER.grid.multiplier
        ctx.beginPath()
        for (let x = xStart; x < xEnd; x += RENDER.grid.size) {
            ctx.moveTo(x, yStart)
            ctx.lineTo(x, yEnd)
        }
        for (let y = yStart; y < yEnd; y += RENDER.grid.size) {
            ctx.moveTo(xStart, y)
            ctx.lineTo(xEnd, y)
        }
        ctx.stroke()
    }

    // Links
    links.forEach((link) => {
        const source = link.source as D3GraphNode,
            target = link.target as D3GraphNode
        const isRelated =
            hoverNode &&
            (source.id === hoverNode.id || target.id === hoverNode.id)

        ctx.beginPath()
        ctx.moveTo(source.x!, source.y!)
        ctx.lineTo(target.x!, target.y!)
        ctx.strokeStyle = isRelated
            ? activeTheme.linkHighlight
            : activeTheme.link
        ctx.lineWidth = isRelated ? RENDER.link.widthHighlight : RENDER.link.widthDefault
        ctx.stroke()

        if (isRelated) {
            ctx.fillStyle = activeTheme.linkHighlight
            drawArrow(ctx, source.x!, source.y!, target.x!, target.y!, RENDER.arrow.targetOffset)
        }
    })

    // Nodes
    nodes.forEach((node) => {
        const isHover = hoverNode?.id === node.id
        const isNeighbor = hoverNode !== null && neighborIds.has(node.id)

        const baseRadius = node.group === 'tag' ? RENDER.node.radiusTag : RENDER.node.radiusPost
        const radius = isHover ? baseRadius * RENDER.node.hoverScale : baseRadius
        const nodeColor = getNodeColor(node, isDark, activeTheme)

        // Halo
        if (isHover || isNeighbor) {
            ctx.beginPath()
            ctx.arc(node.x!, node.y!, radius + RENDER.node.haloOffset, 0, 2 * Math.PI)
            ctx.fillStyle =
                node.group === 'tag'
                    ? RENDER.halo.tag
                    : isDark
                        ? RENDER.halo.dark
                        : RENDER.halo.light
            ctx.fill()
        }

        // Core
        ctx.beginPath()
        ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI)

        ctx.shadowColor = isDark ? nodeColor : RENDER.shadow.light
        ctx.shadowBlur = isHover
            ? activeTheme.glowIntensityHover
            : activeTheme.glowIntensity

        ctx.fillStyle = nodeColor
        ctx.fill()
        ctx.shadowBlur = 0

        // Label
        const degree = node.degree || 0
        const isImportant = degree > GRAPH_CONFIG.interaction.importantDegree
        if (
            isHover ||
            transform.k > GRAPH_CONFIG.interaction.lodThreshold ||
            (transform.k > RENDER.label.importantZoomMin && isImportant)
        ) {
            const label = node.name
            ctx.save()
            ctx.translate(node.x!, node.y!)
            ctx.scale(1 / transform.k, 1 / transform.k)
            ctx.font = `${isHover || isImportant ? '600' : 'normal'} ${RENDER.label.fontSize}px Sans-Serif`
            const textWidth = ctx.measureText(label).width

            ctx.fillStyle = isDark
                ? RENDER.labelBg.dark
                : RENDER.labelBg.light
            const px = -textWidth / 2 - RENDER.label.paddingX,
                py = radius * transform.k + RENDER.label.paddingY,
                pw = textWidth + RENDER.label.paddingX * 2,
                ph = RENDER.label.height,
                pr = RENDER.label.borderRadius
            ctx.beginPath()
            ctx.moveTo(px + pr, py)
            ctx.lineTo(px + pw - pr, py)
            ctx.quadraticCurveTo(px + pw, py, px + pw, py + pr)
            ctx.lineTo(px + pw, py + ph - pr)
            ctx.quadraticCurveTo(px + pw, py + ph, px + pw - pr, py + ph)
            ctx.lineTo(px + pr, py + ph)
            ctx.quadraticCurveTo(px, py + ph, px, py + ph - pr)
            ctx.lineTo(px, py + pr)
            ctx.quadraticCurveTo(px, py, px + pr, py)
            ctx.fill()
            if (!isDark) {
                ctx.strokeStyle = RENDER.labelBorder.color
                ctx.lineWidth = RENDER.labelBorder.width
                ctx.stroke()
            }

            ctx.fillStyle = isDark ? '#fff' : '#000'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(label, 0, radius * transform.k + RENDER.label.textOffsetY)
            ctx.restore()
        }
    })

    ctx.restore()
}
