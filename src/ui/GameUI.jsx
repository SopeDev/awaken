import { useState, useEffect } from 'react'
import { EventBus } from '../eventBus.js'
import { EntropyStrip } from './EntropyStrip.jsx'
import { NeedsPanel } from './NeedsPanel.jsx'
import { ReasoningPanel } from './ReasoningPanel.jsx'
import { TraitsModal } from './TraitsModal.jsx'
import { GAME_WIDTH, GAME_HEIGHT, NEEDS_PANEL_HEIGHT, ENTROPY_STRIP_HEIGHT } from '../constants/uiLayout.js'

const defaultState = {
  needs: {},
  pendingNeedDeltas: {},
  entropy: 0,
  traits: {},
  reasoningText: 'Waiting for next decision…'
}

export function GameUI() {
  const [state, setState] = useState(defaultState)
  const [traitsModalOpen, setTraitsModalOpen] = useState(false)

  useEffect(() => {
    const handler = (payload) => {
      setState({
        needs: payload.needs ?? defaultState.needs,
        pendingNeedDeltas: payload.pendingNeedDeltas ?? defaultState.pendingNeedDeltas,
        entropy: payload.entropy ?? 0,
        traits: payload.traits ?? defaultState.traits,
        reasoningText: payload.reasoningText ?? defaultState.reasoningText
      })
    }
    EventBus.on('room-ui-state', handler)
    return () => EventBus.off('room-ui-state', handler)
  }, [])

  const panelTop = GAME_HEIGHT - NEEDS_PANEL_HEIGHT - ENTROPY_STRIP_HEIGHT
  return (
    <div
      className="game-ui-overlay"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: panelTop,
          width: GAME_WIDTH,
          height: ENTROPY_STRIP_HEIGHT + NEEDS_PANEL_HEIGHT,
          background: 'rgba(26,26,26,0.95)'
        }}
      />
      <EntropyStrip entropy={state.entropy} />
      <NeedsPanel
        needs={state.needs}
        pendingNeedDeltas={state.pendingNeedDeltas}
        onOpenTraits={() => setTraitsModalOpen(true)}
      />
      <ReasoningPanel text={state.reasoningText} />
      <TraitsModal
        open={traitsModalOpen}
        traits={state.traits}
        onClose={() => setTraitsModalOpen(false)}
      />
    </div>
  )
}
