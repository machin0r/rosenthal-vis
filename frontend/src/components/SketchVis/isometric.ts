import type { ScreenPoint } from './types'

const COS30 = Math.cos(Math.PI / 6) // ~0.866
const SIN30 = Math.sin(Math.PI / 6) // 0.5

export interface IsometricConfig {
  originX: number
  originY: number
  scale: number
}

/**
 * Project a 3D world point to 2D screen coordinates in isometric view.
 * Convention: +X = right-forward, +Y = left-forward, +Z = up
 * Powder bed at Z=0, melt pool depth extends into -Z, laser from +Z
 */
export function isoProject(
  worldX: number,
  worldY: number,
  worldZ: number,
  config: IsometricConfig
): ScreenPoint {
  return {
    x: config.originX + (worldX - worldY) * COS30 * config.scale,
    y: config.originY + (worldX + worldY) * SIN30 * config.scale - worldZ * config.scale,
  }
}

/**
 * Compute a good isometric config for the given canvas and scene size.
 */
export function computeIsoConfig(
  canvasWidth: number,
  canvasHeight: number,
  sceneExtent: number
): IsometricConfig {
  // Scale so the scene fits nicely in the canvas
  const maxDim = Math.min(canvasWidth, canvasHeight)
  const scale = maxDim / (sceneExtent * 3.5)

  return {
    originX: canvasWidth * 0.5,
    originY: canvasHeight * 0.52, // slightly below center to leave room for laser
    scale,
  }
}
