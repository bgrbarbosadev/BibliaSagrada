import { useState, useEffect } from 'react'
import type { BookData } from '../types/bible'

interface UseBibleDataResult {
  data: BookData | null
  loading: boolean
  error: string | null
}

const cache = new Map<string, BookData>()

export function useBibleData(version: string, bookId: string): UseBibleDataResult {
  const [data, setData] = useState<BookData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!version || !bookId) return

    // Limpa imediatamente para não exibir dados do livro anterior
    setData(null)
    setError(null)
    setLoading(false)

    const key = `${version}/${bookId}`

    if (cache.has(key)) {
      setData(cache.get(key)!)
      return
    }

    setLoading(true)

    let cancelled = false

    fetch(`/data/${version}/${bookId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<BookData>
      })
      .then((json) => {
        if (cancelled) return
        cache.set(key, json)
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('Texto não disponível para esta versão/livro.')
        setData(null)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [version, bookId])

  return { data, loading, error }
}
