import { Layout } from './components/Layout'
import { Header } from './components/Header'
import { ControlPanel } from './components/ControlPanel/ControlPanel'
import { SketchCanvas } from './components/SketchVis/SketchCanvas'
import { useParameters } from './hooks/useParameters'
import { useRosenthalCompute } from './hooks/useRosenthalCompute'

export default function App() {
  const { params, selectedMaterial, setParam, applyPreset } = useParameters()
  const { data, loading } = useRosenthalCompute(params)

  return (
    <Layout
      header={<Header />}
      sidebar={
        <ControlPanel
          params={params}
          selectedMaterial={selectedMaterial}
          onParamChange={setParam}
          onPresetSelect={applyPreset}
        />
      }
      main={
        <SketchCanvas data={data} loading={loading} />
      }
      footer={
        <footer
          className="border-t border-border-subtle px-6 py-3 flex items-center justify-between"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <span className="font-mono text-text-muted" style={{ fontSize: '10px' }}>
            T(x,y,z) = T₀ + (η·P)/(2π·k·R) · exp(−v·(R+ξ)/(2α))
          </span>
          <span
            className="font-mono text-text-muted"
            style={{ fontSize: '10px' }}
          >
            Rosenthal 1946
          </span>
        </footer>
      }
    />
  )
}
