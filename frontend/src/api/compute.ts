import type { Parameters, ComputeRequest, ComputeResponse } from '../types'

/** Default grid — tuned to capture the melt pool across all presets */
const DEFAULT_GRID: ComputeRequest['grid'] = {
  x_range: [-0.0005, 0.001],
  y_range: [-0.0004, 0.0004],
  z_range: [0.0, 0.0003],
  resolution: 80,
}

/** Convert frontend units → API units */
function toApiRequest(params: Parameters): ComputeRequest {
  return {
    power:        params.power,
    speed:        params.speed / 1000,          // mm/s → m/s
    absorptivity: params.absorptivity,
    conductivity: params.conductivity,
    diffusivity:  params.diffusivity / 1e6,     // mm²/s → m²/s
    liquidus:     params.liquidus + 273.15,     // °C → K
    preheat:      params.preheat + 273.15,      // °C → K
    grid:         DEFAULT_GRID,
  }
}

export async function fetchCompute(
  params: Parameters,
  signal: AbortSignal,
): Promise<ComputeResponse> {
  const body = toApiRequest(params)

  const res = await fetch('/api/compute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<ComputeResponse>
}
