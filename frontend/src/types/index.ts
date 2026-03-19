// ─── Physics Parameters ────────────────────────────────────────────────────

export interface Parameters {
  power: number          // W       50–500
  speed: number          // mm/s    100–2000  (converted to m/s for API)
  absorptivity: number   //         0.1–0.8
  conductivity: number   // W/m·K   5–50
  diffusivity: number    // mm²/s   1–15      (converted to m²/s for API)
  liquidus: number       // °C      800–1700  (converted to K for API)
  preheat: number        // °C      20–500    (converted to K for API)
  layer_thickness: number // μm     20–100
  hatch_spacing: number   // μm     50–200
}

export interface ParameterMeta {
  key: keyof Parameters
  label: string
  symbol: string
  unit: string
  min: number
  max: number
  step: number
  defaultValue: number
  tooltip: string
}

// ─── Material Presets ──────────────────────────────────────────────────────

export interface MaterialPreset {
  key: string
  label: string
  description: string
  conductivity: number   // W/m·K
  diffusivity: number    // mm²/s
  liquidus: number       // °C
  absorptivity: number
}

// ─── API ────────────────────────────────────────────────────────────────────

export interface GridParams {
  x_range: [number, number]
  y_range: [number, number]
  z_range: [number, number]
  resolution: number
}

export interface ComputeRequest {
  power: number
  speed: number          // m/s
  absorptivity: number
  conductivity: number
  diffusivity: number    // m²/s
  liquidus: number       // K
  preheat: number        // K
  layer_thickness_um: number
  hatch_spacing_um: number
  grid: GridParams
}

export interface TemperatureField {
  data: number[]
  shape: [number, number, number]
  x: number[]
  y: number[]
  z: number[]
}

export interface CrossSection {
  data: number[]
  shape: [number, number]
  x: number[]
  z: number[]
}

export interface PlanView {
  data: number[]
  shape: [number, number]
  x: number[]
  y: number[]
}

export interface MeltPoolMetrics {
  length_um: number
  width_um: number
  depth_um: number
  aspect_ratio: number
  cooling_rate_Ks: number
  G_Km: number
  R_ms: number
  G_over_R: number
}

export interface DefectRisks {
  keyholing: boolean
  lack_of_fusion: boolean
  balling: boolean
}

export interface ComputeResponse {
  temperature_field: TemperatureField
  melt_pool: MeltPoolMetrics
  cross_sections: {
    xz_plane: CrossSection
    xy_plane: PlanView
  }
  defect_risks: DefectRisks
}
