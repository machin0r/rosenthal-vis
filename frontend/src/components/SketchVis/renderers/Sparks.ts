import { isoProject, type IsometricConfig } from '../isometric'
import { wobblyLine } from '../sketch/wobblyLine'
import { noise1D } from '../sketch/noise'
import { PENCIL_COLOR, SPARK_COUNT, SPARK_MAX_LIFE } from '../sketch/constants'
import type { Spark } from '../types'

/**
 * Initialize spark particles.
 */
export function createSparks(): Spark[] {
  const sparks: Spark[] = []
  for (let i = 0; i < SPARK_COUNT; i++) {
    sparks.push(spawnSpark(i))
  }
  return sparks
}

function spawnSpark(seed: number): Spark {
  const angle = noise1D(seed, 0) * Math.PI * 2
  const speed = 0.3 + Math.abs(noise1D(seed, 1)) * 0.5
  const life = 0.5 + Math.abs(noise1D(seed, 2)) * SPARK_MAX_LIFE

  return {
    x: 0,
    y: 0,
    z: 0,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    vz: 0.3 + Math.abs(noise1D(seed, 3)) * 0.6,
    life,
    maxLife: life,
  }
}

/**
 * Update spark positions. Call each frame with dt in seconds.
 */
export function updateSparks(sparks: Spark[], dt: number): void {
  for (let i = 0; i < sparks.length; i++) {
    const s = sparks[i]
    s.x += s.vx * dt
    s.y += s.vy * dt
    s.z += s.vz * dt

    // Gravity
    s.vz -= 0.15 * dt

    s.life -= dt

    if (s.life <= 0) {
      sparks[i] = spawnSpark(i + performance.now() * 0.001)
    }
  }
}

/**
 * Render sparks as short wobbly line segments.
 */
export function renderSparks(
  ctx: CanvasRenderingContext2D,
  sparks: Spark[],
  config: IsometricConfig
) {
  for (let i = 0; i < sparks.length; i++) {
    const s = sparks[i]
    if (s.life <= 0) continue

    const alpha = Math.min(1, s.life / (s.maxLife * 0.3))
    const p = isoProject(s.x, s.y, s.z, config)

    // Draw as a short line in the direction of velocity
    const vp = isoProject(s.x + s.vx * 0.15, s.y + s.vy * 0.15, s.z + s.vz * 0.15, config)

    ctx.save()
    ctx.globalAlpha = alpha * 0.7
    wobblyLine(ctx, p.x, p.y, vp.x, vp.y, {
      amplitude: 0.4,
      seed: i * 5.5,
      strokeWidth: 1,
      color: PENCIL_COLOR,
    })
    ctx.restore()
  }
}
