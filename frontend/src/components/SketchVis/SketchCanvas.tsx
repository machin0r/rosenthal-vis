import { useRef, useEffect, useCallback } from 'react'
import type { ComputeResponse } from '../../types'
import { AnimationState } from './AnimationState'
import { SceneRenderer } from './SceneRenderer'
import { createSparks, updateSparks } from './renderers/Sparks'

interface SketchCanvasProps {
  data: ComputeResponse | null
  loading: boolean
}

export function SketchCanvas({ data, loading }: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(new AnimationState())
  const rendererRef = useRef(new SceneRenderer())
  const sparksRef = useRef(createSparks())
  const rafRef = useRef<number>(0)
  const prevTimeRef = useRef<number>(0)
  const timeRef = useRef<number>(0)

  // Feed new data to animation state
  useEffect(() => {
    if (!data?.melt_pool) return
    const mp = data.melt_pool
    animRef.current.setTarget({
      length: mp.length_um,
      width: mp.width_um,
      depth: mp.depth_um,
    })
  }, [data])

  // Handle canvas sizing
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
  }, [])

  // Animation loop
  useEffect(() => {
    resizeCanvas()

    const observer = new ResizeObserver(() => resizeCanvas())
    if (canvasRef.current?.parentElement) {
      observer.observe(canvasRef.current.parentElement)
    }

    const loop = (timestamp: number) => {
      const dt = prevTimeRef.current ? (timestamp - prevTimeRef.current) / 1000 : 0.016
      prevTimeRef.current = timestamp
      timeRef.current += dt

      // Update animation
      animRef.current.update(dt)
      updateSparks(sparksRef.current, dt)

      // Draw
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      const dims = animRef.current.getCurrent()
      rendererRef.current.render(ctx, w, h, dims, sparksRef.current, timeRef.current)

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [resizeCanvas])

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      {loading && (
        <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid #E0D8D0', fontSize: '12px' }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#C05030' }} />
          <span style={{ color: '#666', fontFamily: "'Caveat', cursive" }}>computing...</span>
        </div>
      )}
    </div>
  )
}
