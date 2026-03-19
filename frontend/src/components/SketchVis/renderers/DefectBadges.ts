import { wobblyLine } from '../sketch/wobblyLine'
import { STROKE_WIDTH_THIN } from '../sketch/constants'
import type { DefectRisks } from '../../../types'

const FONT_FAMILY = "'Caveat', cursive"

const BADGE_DEFS: { risk: keyof DefectRisks; label: string; color: string }[] = [
  { risk: 'keyholing',      label: 'Keyholing',      color: '#C05030' },
  { risk: 'lack_of_fusion', label: 'Lack of Fusion',  color: '#D4880F' },
  { risk: 'balling',        label: 'Balling',         color: '#8B5CF6' },
]

/**
 * Draw hand-drawn defect risk warning badges in the upper-left of the canvas.
 */
export function renderDefectBadges(
  ctx: CanvasRenderingContext2D,
  risks: DefectRisks,
  time: number,
): void {
  const active = BADGE_DEFS.filter((d) => risks[d.risk])
  if (active.length === 0) return

  const startX = 16
  const startY = 16
  const badgeH = 26
  const badgeGap = 6
  const padX = 10

  for (let i = 0; i < active.length; i++) {
    const { label, color, risk } = active[i]
    const y = startY + i * (badgeH + badgeGap)

    ctx.save()

    // Measure text to size the badge
    ctx.font = `15px ${FONT_FAMILY}`
    const warningText = `\u26A0 ${label}`
    const textW = ctx.measureText(warningText).width
    const w = textW + padX * 2

    // Subtle pulsing opacity
    const pulse = 0.85 + 0.15 * Math.sin(time * 2.5 + i * 1.2)

    ctx.globalAlpha = pulse

    // Translucent fill
    ctx.fillStyle = color + '18'
    ctx.beginPath()
    ctx.roundRect(startX, y, w, badgeH, 5)
    ctx.fill()

    // Wobbly border — four edges
    const seed = risk.length * 7.3
    wobblyLine(ctx, startX, y, startX + w, y, {
      amplitude: 0.5, seed, strokeWidth: STROKE_WIDTH_THIN, color,
    })
    wobblyLine(ctx, startX + w, y, startX + w, y + badgeH, {
      amplitude: 0.5, seed: seed + 1, strokeWidth: STROKE_WIDTH_THIN, color,
    })
    wobblyLine(ctx, startX + w, y + badgeH, startX, y + badgeH, {
      amplitude: 0.5, seed: seed + 2, strokeWidth: STROKE_WIDTH_THIN, color,
    })
    wobblyLine(ctx, startX, y + badgeH, startX, y, {
      amplitude: 0.5, seed: seed + 3, strokeWidth: STROKE_WIDTH_THIN, color,
    })

    // Label text
    ctx.font = `15px ${FONT_FAMILY}`
    ctx.fillStyle = color
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(warningText, startX + padX, y + badgeH / 2 + 1)

    ctx.restore()
  }
}
