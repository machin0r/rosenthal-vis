import type { Parameters, MaterialPreset } from '../../types'
import { PARAMETER_META } from './presets'
import { ParameterSlider } from './ParameterSlider'
import { MaterialSelector } from './MaterialSelector'

interface ControlPanelProps {
  params: Parameters
  selectedMaterial: string
  onParamChange: (key: keyof Parameters, value: number) => void
  onPresetSelect: (preset: MaterialPreset) => void
}

const STAGGER_CLASSES = [
  'stagger-1', 'stagger-2', 'stagger-3',
  'stagger-4', 'stagger-5', 'stagger-6', 'stagger-6',
]

export function ControlPanel({
  params,
  selectedMaterial,
  onParamChange,
  onPresetSelect,
}: ControlPanelProps) {
  return (
    <aside
      className="flex flex-col gap-5 h-full overflow-y-auto"
      style={{ minWidth: 0 }}
      aria-label="Parameter controls"
    >
      {/* Header */}
      <div className="animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
        <h2
          className="font-sans font-semibold text-text-primary uppercase tracking-widest"
          style={{ fontSize: '11px', letterSpacing: '0.12em' }}
        >
          Parameters
        </h2>
      </div>

      {/* Material selector */}
      <div className="animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
        <MaterialSelector selectedKey={selectedMaterial} onSelect={onPresetSelect} />
      </div>

      {/* Divider */}
      <div className="border-t border-border-subtle" />

      {/* Sliders */}
      <div className="flex flex-col gap-5">
        {PARAMETER_META.map((meta, i) => (
          <ParameterSlider
            key={meta.key}
            meta={meta}
            value={params[meta.key]}
            onChange={onParamChange}
            animationClass={STAGGER_CLASSES[i + 1] ?? 'stagger-6'}
          />
        ))}
      </div>

      {/* Energy density display */}
      <div
        className="card p-3 animate-fade-in-up stagger-6"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-text-muted" style={{ fontSize: '11px' }}>
            Volumetric Energy Density
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="numeral text-accent-primary font-semibold" style={{ fontSize: '18px' }}>
            {computeED(params).toFixed(1)}
          </span>
          <span className="text-text-muted" style={{ fontSize: '11px' }}>J/mm³</span>
        </div>
        <p className="text-text-muted mt-1 leading-snug" style={{ fontSize: '10px' }}>
          E = P / (v · h · t)
        </p>
      </div>
    </aside>
  )
}

function computeED(p: Parameters): number {
  const hatch = p.hatch_spacing / 1000  // μm → mm
  const layer = p.layer_thickness / 1000 // μm → mm
  return p.power / (p.speed * hatch * layer)
}
