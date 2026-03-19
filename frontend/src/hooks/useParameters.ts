import { useState, useCallback } from 'react'
import type { Parameters, MaterialPreset } from '../types'
import { PARAMETER_META } from '../components/ControlPanel/presets'

function defaultParams(): Parameters {
  const entries = PARAMETER_META.reduce((acc, m) => {
    acc[m.key] = m.defaultValue
    return acc
  }, {} as Parameters)
  return entries
}

export interface UseParametersReturn {
  params: Parameters
  selectedMaterial: string
  setParam: (key: keyof Parameters, value: number) => void
  applyPreset: (preset: MaterialPreset) => void
}

export function useParameters(): UseParametersReturn {
  const [params, setParams] = useState<Parameters>(defaultParams)
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Ti-6Al-4V')

  const setParam = useCallback((key: keyof Parameters, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
    setSelectedMaterial('Custom')
  }, [])

  const applyPreset = useCallback((preset: MaterialPreset) => {
    setSelectedMaterial(preset.key)
    setParams((prev) => ({
      ...prev,
      conductivity: preset.conductivity,
      diffusivity: preset.diffusivity,
      liquidus: preset.liquidus,
      absorptivity: preset.absorptivity,
    }))
  }, [])

  return { params, selectedMaterial, setParam, applyPreset }
}
