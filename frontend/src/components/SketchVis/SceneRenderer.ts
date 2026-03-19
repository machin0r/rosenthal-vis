import { computeIsoConfig } from './isometric'
import { renderPowderBed } from './renderers/PowderBed'
import { renderMeltPool } from './renderers/MeltPool'
import { renderLaserBeam } from './renderers/LaserBeam'
import { renderSparks } from './renderers/Sparks'
import { renderAnnotations } from './renderers/Annotations'
import { renderDefectBadges } from './renderers/DefectBadges'
import type { SketchDimensions, Spark } from './types'
import type { DefectRisks } from '../../types'

export class SceneRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dims: SketchDimensions,
    sparks: Spark[],
    time: number,
    defectRisks: DefectRisks | null,
  ): void {
    // Clear to white
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    // Compute scene extent from dimensions
    const scaleF = 0.005
    const maxExtent = Math.max(
      dims.length * scaleF,
      dims.width * scaleF,
      dims.depth * scaleF,
      2 // minimum
    )
    const bedHalf = maxExtent * 1.5

    const config = computeIsoConfig(width, height, maxExtent)

    // Painter's algorithm (back to front)
    // 1. Powder bed back edges
    renderPowderBed(ctx, config, bedHalf, 'back')

    // 2. Melt pool (depth profile + surface)
    renderMeltPool(ctx, config, dims, time)

    // 3. Powder bed front edges
    renderPowderBed(ctx, config, bedHalf, 'front')

    // 4. Annotations
    renderAnnotations(ctx, config, dims)

    // 5. Sparks
    renderSparks(ctx, sparks, config)

    // 6. Laser beam (on top)
    renderLaserBeam(ctx, config, time)

    // 7. Defect risk badges (screen-space overlay)
    if (defectRisks) {
      renderDefectBadges(ctx, defectRisks, time)
    }
  }
}
