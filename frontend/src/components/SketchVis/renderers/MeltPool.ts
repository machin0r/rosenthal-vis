import { isoProject, type IsometricConfig } from '../isometric'
import { sketchEllipse, ellipseClipPath } from '../sketch/sketchEllipse'
import { doubleCrosshatch } from '../sketch/crosshatch'
import { noise1D } from '../sketch/noise'
import {
  MELT_POOL_FILL,
  MELT_POOL_DEPTH_FILL,
  PENCIL_COLOR,
  PENCIL_LIGHT,
  PENCIL_FAINT,
  STROKE_WIDTH,
  STROKE_WIDTH_THIN,
  WOBBLE_AMP,
} from '../sketch/constants'
import type { SketchDimensions } from '../types'

/**
 * Render the melt pool: surface ellipse + depth profile + crosshatching.
 */
export function renderMeltPool(
  ctx: CanvasRenderingContext2D,
  config: IsometricConfig,
  dims: SketchDimensions,
  time: number
) {
  // Convert um to world units (scale down for vis)
  const scaleF = 0.005 // um -> world units
  const halfL = (dims.length * scaleF) / 2
  const halfW = (dims.width * scaleF) / 2
  const depthW = dims.depth * scaleF

  // Surface ellipse center at origin, Z=0
  const center = isoProject(0, 0, 0, config)

  // Compute isometric radii for the surface ellipse
  // In iso, the ellipse at Z=0 maps to a screen-space ellipse
  const rightPt = isoProject(halfL, 0, 0, config)
  const topPt = isoProject(0, halfW, 0, config)

  const srx = Math.sqrt((rightPt.x - center.x) ** 2 + (rightPt.y - center.y) ** 2)
  const sry = Math.sqrt((topPt.x - center.x) ** 2 + (topPt.y - center.y) ** 2)

  // Ripple effect: modulate wobble amplitude
  const rippleAmp = WOBBLE_AMP + Math.sin(time * 2.5) * 0.6

  // --- Adjacent hatch tracks (ghost ellipses) ---
  const hatchW = dims.hatchSpacing * scaleF
  if (hatchW > 0) {
    renderAdjacentTracks(ctx, config, halfL, halfW, hatchW, rippleAmp)
  }

  // --- Depth profile (visible side) ---
  renderDepthProfile(ctx, config, halfL, halfW, depthW, rippleAmp)

  // --- Surface ellipse ---
  // The surface ellipse in iso projection needs rotation
  // We'll draw it as a transformed ellipse
  const angle = Math.atan2(rightPt.y - center.y, rightPt.x - center.x)

  ctx.save()
  ctx.translate(center.x, center.y)
  ctx.rotate(angle)

  // Draw filled + stroked ellipse
  sketchEllipse(ctx, 0, 0, srx, sry, {
    amplitude: rippleAmp,
    seed: 10,
    fillColor: MELT_POOL_FILL,
    color: PENCIL_COLOR,
    strokeWidth: STROKE_WIDTH,
  })

  // Crosshatch on surface (clipped to ellipse)
  ctx.save()
  ellipseClipPath(ctx, 0, 0, srx - 2, sry - 2, 10, rippleAmp)
  ctx.clip()

  // Denser hatch near center, lighter at edges
  doubleCrosshatch(ctx, { x: -srx, y: -sry, w: srx * 2, h: sry * 2 }, {
    spacing: 10,
    color: PENCIL_LIGHT,
    strokeWidth: STROKE_WIDTH_THIN,
    amplitude: 0.8,
    seedBase: 20,
  })

  // Denser center hatch
  doubleCrosshatch(ctx, { x: -srx * 0.4, y: -sry * 0.4, w: srx * 0.8, h: sry * 0.8 }, {
    spacing: 6,
    color: PENCIL_LIGHT,
    strokeWidth: STROKE_WIDTH_THIN,
    amplitude: 0.6,
    seedBase: 40,
  })

  ctx.restore()
  ctx.restore()
}

function renderDepthProfile(
  ctx: CanvasRenderingContext2D,
  config: IsometricConfig,
  halfL: number,
  halfW: number,
  depth: number,
  wobbleAmp: number
) {
  // The depth profile is a curved shape visible from the isometric angle
  // It shows the cross-section of the ellipsoidal pool
  // We draw the front-facing arc of the bottom of the pool

  const segments = 24
  const topPoints: { x: number; y: number }[] = []
  const bottomPoints: { x: number; y: number }[] = []

  // Visible front arc: from -halfL to +halfL along the front edge
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const angle = -Math.PI / 2 + Math.PI * t // front semicircle

    const wx = Math.cos(angle) * halfL
    const wy = halfW // front edge

    // Top point (at surface)
    const tp = isoProject(wx, wy, 0, config)
    const tn = noise1D(i * 0.5, 50) * wobbleAmp * 0.5
    topPoints.push({ x: tp.x + tn, y: tp.y + tn })

    // Bottom point (depth follows ellipsoidal shape)
    const depthAtX = depth * Math.sqrt(Math.max(0, 1 - (wx / halfL) ** 2))
    const bp = isoProject(wx, wy, -depthAtX, config)
    const bn = noise1D(i * 0.5, 60) * wobbleAmp * 0.5
    bottomPoints.push({ x: bp.x + bn, y: bp.y + bn })
  }

  // Fill the depth shape
  ctx.beginPath()
  ctx.moveTo(topPoints[0].x, topPoints[0].y)
  for (const p of topPoints) ctx.lineTo(p.x, p.y)
  for (let i = bottomPoints.length - 1; i >= 0; i--) {
    ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y)
  }
  ctx.closePath()
  ctx.fillStyle = MELT_POOL_DEPTH_FILL
  ctx.fill()

  // Crosshatch the depth area (denser = shadow)
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(topPoints[0].x, topPoints[0].y)
  for (const p of topPoints) ctx.lineTo(p.x, p.y)
  for (let i = bottomPoints.length - 1; i >= 0; i--) {
    ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y)
  }
  ctx.closePath()
  ctx.clip()

  const minX = Math.min(...bottomPoints.map(p => p.x), ...topPoints.map(p => p.x))
  const maxX = Math.max(...bottomPoints.map(p => p.x), ...topPoints.map(p => p.x))
  const minY = Math.min(...topPoints.map(p => p.y))
  const maxY = Math.max(...bottomPoints.map(p => p.y))

  doubleCrosshatch(ctx, { x: minX, y: minY, w: maxX - minX, h: maxY - minY }, {
    spacing: 6,
    color: PENCIL_LIGHT,
    strokeWidth: STROKE_WIDTH_THIN,
    amplitude: 0.6,
    seedBase: 70,
  })
  ctx.restore()

  // Stroke the bottom curve
  ctx.beginPath()
  ctx.moveTo(bottomPoints[0].x, bottomPoints[0].y)
  for (let i = 1; i < bottomPoints.length; i++) {
    ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y)
  }
  ctx.strokeStyle = PENCIL_COLOR
  ctx.lineWidth = STROKE_WIDTH
  ctx.lineCap = 'round'
  ctx.stroke()
}

/**
 * Draw faint ghost ellipses for adjacent hatch tracks at ±hatch spacing,
 * showing overlap (or gaps) with the primary melt pool.
 */
function renderAdjacentTracks(
  ctx: CanvasRenderingContext2D,
  config: IsometricConfig,
  halfL: number,
  halfW: number,
  hatchW: number,
  wobbleAmp: number
) {
  // Draw one ghost track on each side (±hatch spacing in Y)
  const offsets = [-hatchW, hatchW]

  for (let idx = 0; idx < offsets.length; idx++) {
    const yOffset = offsets[idx]
    const ghostCenter = isoProject(0, yOffset, 0, config)
    const ghostRight = isoProject(halfL, yOffset, 0, config)
    const ghostTop = isoProject(0, yOffset + halfW, 0, config)

    const grx = Math.sqrt((ghostRight.x - ghostCenter.x) ** 2 + (ghostRight.y - ghostCenter.y) ** 2)
    const gry = Math.sqrt((ghostTop.x - ghostCenter.x) ** 2 + (ghostTop.y - ghostCenter.y) ** 2)

    const angle = Math.atan2(ghostRight.y - ghostCenter.y, ghostRight.x - ghostCenter.x)

    ctx.save()
    ctx.globalAlpha = 0.6
    ctx.translate(ghostCenter.x, ghostCenter.y)
    ctx.rotate(angle)

    sketchEllipse(ctx, 0, 0, grx, gry, {
      amplitude: wobbleAmp * 0.6,
      seed: 200 + idx * 50,
      fillColor: undefined,
      color: PENCIL_FAINT,
      strokeWidth: STROKE_WIDTH_THIN,
    })

    // Light dashed center line for the hatch track
    ctx.setLineDash([4, 6])
    ctx.beginPath()
    ctx.moveTo(-grx, 0)
    ctx.lineTo(grx, 0)
    ctx.strokeStyle = PENCIL_FAINT
    ctx.lineWidth = STROKE_WIDTH_THIN
    ctx.stroke()
    ctx.setLineDash([])

    ctx.restore()
  }
}
