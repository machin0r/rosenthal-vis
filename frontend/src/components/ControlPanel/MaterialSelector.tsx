import type { MaterialPreset } from '../../types'
import { MATERIAL_PRESETS } from './presets'

interface MaterialSelectorProps {
  selectedKey: string
  onSelect: (preset: MaterialPreset) => void
}

export function MaterialSelector({ selectedKey, onSelect }: MaterialSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = MATERIAL_PRESETS.find((p) => p.key === e.target.value)
    if (preset) onSelect(preset)
  }

  const current = MATERIAL_PRESETS.find((p) => p.key === selectedKey)

  return (
    <div className="flex flex-col gap-1.5 animate-fade-in-up stagger-1">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
          Material Preset
        </span>
      </div>
      <select
        className="styled-select"
        value={selectedKey}
        onChange={handleChange}
        aria-label="Material preset"
      >
        {MATERIAL_PRESETS.map((preset) => (
          <option key={preset.key} value={preset.key}>
            {preset.label}
          </option>
        ))}
      </select>
      {current && current.key !== 'Custom' && (
        <p className="text-text-muted leading-snug" style={{ fontSize: '11px' }}>
          {current.description}
        </p>
      )}
    </div>
  )
}
