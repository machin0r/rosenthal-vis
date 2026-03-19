import { useEffect, useRef, useState } from 'react'
import type { Parameters, ComputeResponse } from '../types'
import { fetchCompute } from '../api/compute'

const DEBOUNCE_MS = 50

export interface UseRosenthalComputeReturn {
  data: ComputeResponse | null
  loading: boolean
  error: string | null
}

export function useRosenthalCompute(params: Parameters): UseRosenthalComputeReturn {
  const [data, setData] = useState<ComputeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Cancel any in-flight request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setLoading(true)
      setError(null)

      fetchCompute(params, abortRef.current.signal)
        .then((result) => {
          setData(result)
          setLoading(false)
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') return
          setError(err instanceof Error ? err.message : 'Unknown error')
          setLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [params])  // eslint-disable-line react-hooks/exhaustive-deps
  // Note: params is a new object on every render from useParameters, which is
  // intentional — the effect re-runs whenever any parameter changes.

  return { data, loading, error }
}
