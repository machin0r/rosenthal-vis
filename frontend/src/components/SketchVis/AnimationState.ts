import type { SketchDimensions } from './types'
import { LERP_DURATION_MS } from './sketch/constants'

function easeInOut(t: number): number {
  return t < 0.5
    ? 2 * t * t
    : 1 - (-2 * t + 2) ** 2 / 2
}

function lerpVal(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export class AnimationState {
  private from: SketchDimensions
  private to: SketchDimensions
  private t: number = 1 // start fully converged
  private duration: number = LERP_DURATION_MS / 1000

  constructor(initial?: SketchDimensions) {
    const def = initial ?? { length: 200, width: 100, depth: 50 }
    this.from = { ...def }
    this.to = { ...def }
  }

  /** Set a new target. Snapshots current interpolated state as the start. */
  setTarget(dims: SketchDimensions): void {
    this.from = this.getCurrent()
    this.to = { ...dims }
    this.t = 0
  }

  /** Advance time by dt seconds. */
  update(dt: number): void {
    if (this.t >= 1) return
    this.t = Math.min(1, this.t + dt / this.duration)
  }

  /** Get the current interpolated dimensions. */
  getCurrent(): SketchDimensions {
    const e = easeInOut(this.t)
    return {
      length: lerpVal(this.from.length, this.to.length, e),
      width: lerpVal(this.from.width, this.to.width, e),
      depth: lerpVal(this.from.depth, this.to.depth, e),
    }
  }
}
