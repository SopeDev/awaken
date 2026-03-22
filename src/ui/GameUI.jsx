import { useState, useEffect } from 'react'
import { EventBus } from '../eventBus.js'
import { AwarenessStrip } from './AwarenessStrip.jsx'
import { NeedsPanel } from './NeedsPanel.jsx'
import { ReasoningPanel } from './ReasoningPanel.jsx'
import { GameClockPanel } from './GameClockPanel.jsx'
import { formatInGameClock, IN_GAME_CLOCK_START_MINUTES } from '../constants/gameSession.js'
import { TraitsModal } from './TraitsModal.jsx'
import { GAME_WIDTH, GAME_HEIGHT, NEEDS_PANEL_HEIGHT, ENTROPY_STRIP_HEIGHT } from '../constants/uiLayout.js'
import { AbilityBar } from './AbilityBar/AbilityBar.jsx'

const defaultState = {
  needs: {},
  pendingNeedDeltas: {},
  awareness: 0,
  traits: {},
  reasoningText: 'Waiting for next decision…',
  signalCooldownsMs: { directional: 0, intuition: 0, synchronicity: 0 },
  avatarPhase: 'awaiting'
}

export function GameUI() {
  const [state, setState] = useState(defaultState)
  const [traitsModalOpen, setTraitsModalOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    const handler = (payload) => {
      setState({
        needs: payload.needs ?? defaultState.needs,
        pendingNeedDeltas: payload.pendingNeedDeltas ?? defaultState.pendingNeedDeltas,
        awareness: payload.awareness ?? 0,
        traits: payload.traits ?? defaultState.traits,
        reasoningText: payload.reasoningText ?? defaultState.reasoningText,
        gameClockDisplay: payload.gameClockDisplay ?? defaultState.gameClockDisplay,
        signalCooldownsMs: payload.signalCooldownsMs ?? defaultState.signalCooldownsMs,
        avatarPhase: payload.avatarPhase ?? defaultState.avatarPhase
      })
    }
    EventBus.on('room-ui-state', handler)
    return () => EventBus.off('room-ui-state', handler)
  }, [])

  const panelTop = GAME_HEIGHT - NEEDS_PANEL_HEIGHT - ENTROPY_STRIP_HEIGHT

  const togglePause = () => {
    setPaused((p) => {
      const next = !p
      EventBus.emit('toggle-pause', next)
      return next
    })
  }

  const setGameSpeed = (nextSpeed) => {
    const v = Number(nextSpeed)
    if (!Number.isFinite(v) || v <= 0) return
    setSpeed(v)
    EventBus.emit('set-speed', v)
  }

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6
        }}
      >
        <button
          type="button"
          onClick={togglePause}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            background: 'rgba(20,20,20,0.85)',
            border: '1px solid #444',
            borderRadius: 6,
            color: '#e8e8e8',
            fontSize: 12
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: '#b0b0b0' }}>Speed</span>
          <select
            value={speed}
            onChange={(e) => setGameSpeed(e.target.value)}
            style={{
              fontSize: 12,
              padding: '4px 8px',
              background: 'rgba(20,20,20,0.85)',
              border: '1px solid #444',
              borderRadius: 6,
              color: '#e8e8e8',
              cursor: 'pointer'
            }}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
            <option value={30}>30x</option>
            <option value={60}>60x</option>
          </select>
        </div>
      </div>

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
      <AwarenessStrip awareness={state.awareness} />
      <NeedsPanel
        needs={state.needs}
        pendingNeedDeltas={state.pendingNeedDeltas}
        onOpenTraits={() => setTraitsModalOpen(true)}
      />
      <ReasoningPanel text={state.reasoningText} />
      <GameClockPanel display={state.gameClockDisplay} />
      </div>
      <AbilityBar signalCooldownsMs={state.signalCooldownsMs} avatarPhase={state.avatarPhase} />
      <TraitsModal
        open={traitsModalOpen}
        traits={state.traits}
        onClose={() => setTraitsModalOpen(false)}
      />
    </>
  )
}
