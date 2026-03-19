export interface SketchDimensions {
  length: number  // um
  width: number   // um
  depth: number   // um
}

export interface ScreenPoint {
  x: number
  y: number
}

export interface Spark {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number    // 0–1, decreasing
  maxLife: number
}
