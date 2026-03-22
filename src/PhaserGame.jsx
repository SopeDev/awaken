import { useEffect, useRef } from 'react'
import { createGame } from './game/main.js'
import { EventBus } from './eventBus.js'

export function PhaserGame({ onSceneReady }) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const game = createGame(containerRef.current)
    gameRef.current = game
    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  useEffect(() => {
    const handler = (scene) => {
      if (onSceneReady) onSceneReady(scene)
    }
    EventBus.on('current-scene-ready', handler)
    return () => EventBus.off('current-scene-ready', handler)
  }, [onSceneReady])

  return (
    <div
      ref={containerRef}
      className="phaser-container"
      style={{ width: '100%', height: '100%', minHeight: 0 }}
    />
  )
}
