import { useRef } from 'react'
import { PhaserGame } from './PhaserGame.jsx'
import { GameUI } from './ui/GameUI.jsx'

function App() {
  const phaserRef = useRef(null)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <PhaserGame
        onSceneReady={(scene) => {
          phaserRef.current = scene
        }}
      >
        <GameUI />
      </PhaserGame>
    </div>
  )
}

export default App
