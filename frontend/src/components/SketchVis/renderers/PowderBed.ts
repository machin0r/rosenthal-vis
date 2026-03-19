import { isoProject, type IsometricConfig } from '../isometric'
import { wobblyLine } from '../sketch/wobblyLine'
import { noise1D } from '../sketch/noise'
import { POWDER_BED_FILL, PENCIL_COLOR, PENCIL_FAINT, STROKE_WIDTH } from '../sketch/constants'

/**
 * Render the powder bed as an isometric parallelogram at Z=0.
 * `pass` controls which edges to draw:
 *   'back'  — fill + back edges (drawn before melt pool)
 *   'front' — front edges only (drawn after melt pool)
 */
export function renderPowderBed(
  ctx: CanvasRenderingContext2D,
  config: IsometricConfig,
  halfSize: number,
  pass: 'back' | 'front'
) {
  // Four corners of the bed in world space (Z=0)
  const corners = [
    isoProject(-halfSize, -halfSize, 0, config), // back-left
    isoProject(halfSize, -halfSize, 0, config),  // back-right
    isoProject(halfSize, halfSize, 0, config),   // front-right
    isoProject(-halfSize, halfSize, 0, config),  // front-left
  ]

  if (pass === 'back') {
    // Fill
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y)
    ctx.closePath()
    ctx.fillStyle = POWDER_BED_FILL
    ctx.fill()

    // Powder dots (seeded, no flicker)
    const dotCount = Math.min(200, Math.floor(halfSize * 1.5))
    ctx.fillStyle = PENCIL_FAINT
    for (let i = 0; i < dotCount; i++) {
      const wx = noise1D(i * 0.73, 42) * halfSize * 0.9
      const wy = noise1D(i * 0.73, 99) * halfSize * 0.9
      const p = isoProject(wx, wy, 0, config)
      const r = 0.8 + noise1D(i, 7) * 0.6
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Back edges (top-left and top-right in iso)
    // Edge: corners[0] -> corners[1] (back edge)
    wobblyLine(ctx, corners[0].x, corners[0].y, corners[1].x, corners[1].y, {
      seed: 1.1, color: PENCIL_COLOR, strokeWidth: STROKE_WIDTH,
    })
    // Edge: corners[0] -> corners[3] (left edge)
    wobblyLine(ctx, corners[0].x, corners[0].y, corners[3].x, corners[3].y, {
      seed: 2.2, color: PENCIL_COLOR, strokeWidth: STROKE_WIDTH,
    })
  }

  if (pass === 'front') {
    // Front edges
    // Edge: corners[1] -> corners[2] (right edge)
    wobblyLine(ctx, corners[1].x, corners[1].y, corners[2].x, corners[2].y, {
      seed: 3.3, color: PENCIL_COLOR, strokeWidth: STROKE_WIDTH,
    })
    // Edge: corners[3] -> corners[2] (bottom edge)
    wobblyLine(ctx, corners[3].x, corners[3].y, corners[2].x, corners[2].y, {
      seed: 4.4, color: PENCIL_COLOR, strokeWidth: STROKE_WIDTH,
    })
  }
}
