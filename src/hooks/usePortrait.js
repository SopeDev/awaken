import { useState, useEffect } from 'react'

/**
 * True when the viewport is portrait (height >= width), e.g. phone upright.
 * Uses aspect ratio so it matches narrow desktop windows too.
 */
export function usePortrait() {
  const [portrait, setPortrait] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth
  })

  useEffect(() => {
    const update = () => {
      setPortrait(window.innerHeight > window.innerWidth)
    }
    window.addEventListener('resize', update)
    const mq = window.matchMedia('(orientation: portrait)')
    const onOrient = () => update()
    mq.addEventListener?.('change', onOrient)
    return () => {
      window.removeEventListener('resize', update)
      mq.removeEventListener?.('change', onOrient)
    }
  }, [])

  return portrait
}
