import { useCallback } from 'react'
import type { ParameterMeta, Parameters } from '../../types'
import { Tooltip } from '../ui/Tooltip'

interface ParameterSliderProps {
  meta: ParameterMeta
  value: number
  onChange: (key: keyof Parameters, value: number) => void
  animationClass?: string
}

export function ParameterSlider({ meta, value, onChange, animationClass }: ParameterSliderProps) {
  const { key, label, symbol, unit, min, max, step, tooltip } = meta

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(key, parseFloat(e.target.value))
    },
    [key, onChange]
  )

  // Fraction for the filled-track gradient
  const pct = ((value - min) / (max - min)) * 100

  const displayValue = step < 0.1
    ? value.toFixed(2)
    : step < 1
    ? value.toFixed(1)
    : value.toString()

  return (
    <div
      className={`flex flex-col gap-1.5 animate-fade-in-up ${animationClass ?? ''}`}
      style={{ opacity: 0 }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-text-secondary text-xs font-medium truncate">{label}</span>
          <Tooltip content={tooltip} />
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span
            className="numeral text-accent-primary font-medium tabular-nums"
            style={{ fontSize: '13px' }}
          >
            {displayValue}
          </span>
          {unit && (
            <span className="text-text-muted" style={{ fontSize: '11px' }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative flex items-center">
        {/* Filled track */}
        <div
          className="absolute inset-y-0 left-0 flex items-center pointer-events-none"
          style={{ width: '100%' }}
        >
          <div
            className="rounded-l-full transition-all duration-75"
            style={{
              width: `${pct}%`,
              height: '2px',
              background: 'var(--text-primary)',
            }}
          />
        </div>
        <input
          type="range"
          className="param-slider relative z-10"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          aria-label={`${label} (${symbol})`}
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Min/max hints */}
      <div className="flex justify-between text-text-muted" style={{ fontSize: '10px' }}>
        <span className="numeral">{min}{unit ? ` ${unit}` : ''}</span>
        <span className="numeral">{max}{unit ? ` ${unit}` : ''}</span>
      </div>
    </div>
  )
}
