import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — WorldMap` : 'WorldMap — Explora el mundo'
    return () => {
      document.title = 'WorldMap — Explora el mundo'
    }
  }, [title])
}