import { useRef, useState, useEffect } from 'react'
import { PhaserGame } from './PhaserGame.jsx'
import { GameUI } from './ui/GameUI.jsx'
import { GAME_WIDTH, GAME_HEIGHT } from './constants/uiLayout.js'

function useViewportGameScale() {
  const [scale, setScale] = useState(() => {
    if (typeof window === 'undefined') return 1
    return Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT)
  })

  useEffect(() => {
    const onResize = () => {
      setScale(Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return scale
}

function App() {
  const phaserRef = useRef(null)
  const scale = useViewportGameScale()

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: GAME_WIDTH * scale,
          height: GAME_HEIGHT * scale,
          position: 'relative',
          flexShrink: 0
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
          }}
        >
          <PhaserGame onSceneReady={(scene) => { phaserRef.current = scene }} />
          <GameUI />
        </div>
      </div>
    </div>
  )
}

export default App
