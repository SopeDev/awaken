import { useEffect, useRef } from 'react'
import { createGame } from './game/main.js'
import { EventBus } from './eventBus.js'

/**
 * Phaser uses Scale.RESIZE — canvas fills this host. React HUD uses fixed positioning
 * to the viewport (see GameUI); no coordinate transform overlay.
 */
export function PhaserGame({ onSceneReady, children }) {
  const phaserHostRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    if (!phaserHostRef.current) return
    const game = createGame(phaserHostRef.current)
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
      className="phaser-viewport"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 0,
        flex: '1 1 auto',
        overflow: 'hidden'
      }}
    >
      <div
        ref={phaserHostRef}
        className="phaser-container"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          minHeight: 0
        }}
      />
      {children}
    </div>
  )
}
