import { useRef } from 'react'
import { PhaserGame } from './PhaserGame.jsx'
import { GameUI } from './ui/GameUI.jsx'
import { GAME_WIDTH, GAME_HEIGHT } from './constants/uiLayout.js'

function App() {
  const phaserRef = useRef(null)

  return (
    <div
      style={{
        position: 'relative',
        width: GAME_WIDTH,
        height: GAME_HEIGHT
      }}
    >
      <PhaserGame onSceneReady={(scene) => { phaserRef.current = scene }} />
      <GameUI />
    </div>
  )
}

export default App
