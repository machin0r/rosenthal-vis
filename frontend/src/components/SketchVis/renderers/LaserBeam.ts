import { isoProject, type IsometricConfig } from '../isometric'
import { wobblyLine } from '../sketch/wobblyLine'
import { PENCIL_COLOR, LASER_GLOW_COLOR, STROKE_WIDTH_THIN } from '../sketch/constants'

/**
 * Render a converging laser beam from above to pool center.
 */
export function renderLaserBeam(
  ctx: CanvasRenderingContext2D,
  config: IsometricConfig,
  time: number
) {
  const impactPoint = isoProject(0, 0, 0, config)
  const beamTop = isoProject(0, 0, 5, config) // high above

  // Beam width at top
  const topSpread = 12
  // Multiple converging lines
  const lineCount = 5
  const pulse = 0.7 + Math.sin(time * 3) * 0.3

  ctx.save()
  ctx.globalAlpha = 0.6 * pulse

  for (let i = 0; i < lineCount; i++) {
    const offset = (i - (lineCount - 1) / 2) * (topSpread / (lineCount - 1))
    const topX = beamTop.x + offset
    const topY = beamTop.y

    wobblyLine(ctx, topX, topY, impactPoint.x, impactPoint.y, {
      amplitude: 0.8,
      seed: 100 + i * 3,
      strokeWidth: STROKE_WIDTH_THIN,
      color: PENCIL_COLOR,
    })
  }

  ctx.globalAlpha = 1
  ctx.restore()

  // Glow at impact point
  const glowRadius = 4 + Math.sin(time * 4) * 1.5
  const gradient = ctx.createRadialGradient(
    impactPoint.x, impactPoint.y, 0,
    impactPoint.x, impactPoint.y, glowRadius * 3
  )
  gradient.addColorStop(0, LASER_GLOW_COLOR + '60')
  gradient.addColorStop(0.5, LASER_GLOW_COLOR + '20')
  gradient.addColorStop(1, LASER_GLOW_COLOR + '00')

  ctx.beginPath()
  ctx.arc(impactPoint.x, impactPoint.y, glowRadius * 3, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  // Short radiating lines around impact
  const rayCount = 8
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + time * 0.5
    const innerR = glowRadius * 0.8
    const outerR = glowRadius * 1.8
    const x0 = impactPoint.x + Math.cos(angle) * innerR
    const y0 = impactPoint.y + Math.sin(angle) * innerR
    const x1 = impactPoint.x + Math.cos(angle) * outerR
    const y1 = impactPoint.y + Math.sin(angle) * outerR

    ctx.save()
    ctx.globalAlpha = 0.3 * pulse
    wobblyLine(ctx, x0, y0, x1, y1, {
      amplitude: 0.5,
      seed: 200 + i,
      strokeWidth: STROKE_WIDTH_THIN,
      color: LASER_GLOW_COLOR,
    })
    ctx.restore()
  }
}
