import { isoProject, type IsometricConfig } from '../isometric'
import { wobblyLine } from '../sketch/wobblyLine'
import { PENCIL_COLOR, PENCIL_LIGHT, STROKE_WIDTH_THIN } from '../sketch/constants'
import type { SketchDimensions } from '../types'

const TICK_SIZE = 4
const LABEL_OFFSET = 16
const FONT_FAMILY = "'Caveat', cursive"

/**
 * Render dimension annotations with hand-drawn leader lines.
 */
export function renderAnnotations(
  ctx: CanvasRenderingContext2D,
  config: IsometricConfig,
  dims: SketchDimensions
) {
  const scaleF = 0.005
  const halfL = (dims.length * scaleF) / 2
  const halfW = (dims.width * scaleF) / 2
  const depth = dims.depth * scaleF

  // --- Length annotation (along X axis, offset in -Y direction) ---
  {
    const yOff = -halfW - 1.2
    const p0 = isoProject(-halfL, yOff, 0, config)
    const p1 = isoProject(halfL, yOff, 0, config)
    drawDimensionLine(ctx, p0, p1, `L = ${Math.round(dims.length)} \u00b5m`, 'above')
  }

  // --- Width annotation (along Y axis, offset in +X direction) ---
  {
    const xOff = halfL + 1.2
    const p0 = isoProject(xOff, -halfW, 0, config)
    const p1 = isoProject(xOff, halfW, 0, config)
    drawDimensionLine(ctx, p0, p1, `W = ${Math.round(dims.width)} \u00b5m`, 'above')
  }

  // --- Depth annotation (along Z axis, at front-right) ---
  {
    const xOff = halfL + 1.2
    const yOff = halfW
    const p0 = isoProject(xOff, yOff, 0, config)
    const p1 = isoProject(xOff, yOff, -depth, config)
    drawDimensionLine(ctx, p0, p1, `D = ${Math.round(dims.depth)} \u00b5m`, 'right')
  }
}

function drawDimensionLine(
  ctx: CanvasRenderingContext2D,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  label: string,
  labelPos: 'above' | 'right'
) {
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 5) return

  // Perpendicular for ticks
  const nx = -dy / len
  const ny = dx / len

  // Leader line
  wobblyLine(ctx, p0.x, p0.y, p1.x, p1.y, {
    amplitude: 0.8,
    seed: p0.x * 0.1 + p0.y * 0.1,
    strokeWidth: STROKE_WIDTH_THIN,
    color: PENCIL_LIGHT,
  })

  // End ticks
  for (const p of [p0, p1]) {
    wobblyLine(
      ctx,
      p.x - nx * TICK_SIZE, p.y - ny * TICK_SIZE,
      p.x + nx * TICK_SIZE, p.y + ny * TICK_SIZE,
      {
        amplitude: 0.4,
        seed: p.x * 0.2,
        strokeWidth: STROKE_WIDTH_THIN,
        color: PENCIL_LIGHT,
      }
    )
  }

  // Label
  const midX = (p0.x + p1.x) / 2
  const midY = (p0.y + p1.y) / 2

  ctx.save()
  ctx.font = `16px ${FONT_FAMILY}`
  ctx.fillStyle = PENCIL_COLOR
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'

  if (labelPos === 'above') {
    ctx.fillText(label, midX + nx * LABEL_OFFSET, midY + ny * LABEL_OFFSET - 2)
  } else {
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, Math.max(p0.x, p1.x) + 10, midY)
  }

  ctx.restore()
}
