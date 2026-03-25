import { useState, useEffect, useRef } from 'react'
import { EventBus } from '../eventBus.js'
import { AwarenessStrip } from './AwarenessStrip.jsx'
import { NeedsPanel } from './NeedsPanel.jsx'
import { ReasoningPanel } from './ReasoningPanel.jsx'
import { GameClockPanel } from './GameClockPanel.jsx'
import { TraitsModal } from './TraitsModal.jsx'
import {
  DEFAULT_HUD_CHROME_HEIGHT,
  NEEDS_PANEL_HEIGHT
} from '../constants/uiLayout.js'
import { AbilityBar } from './AbilityBar/AbilityBar.jsx'
import { usePortrait } from '../hooks/usePortrait.js'
import { getCharacterState, setConsciousnessLevel } from '../systems/character/index.js'

const defaultState = {
  needs: {},
  pendingNeedDeltas: {},
  awareness: 0,
  awarenessBaseline: 0,
  awarenessDynamicBuffer: 0,
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
  const [consciousnessLevel, setConsciousnessLevelUi] = useState(
    Math.max(0, Math.min(4, Number(getCharacterState().consciousnessLevel) || 0))
  )
  const [hudHeight, setHudHeight] = useState(DEFAULT_HUD_CHROME_HEIGHT)
  const portrait = usePortrait()
  const hudRef = useRef(null)

  useEffect(() => {
    const handler = (payload) => {
      setState({
        needs: payload.needs ?? defaultState.needs,
        pendingNeedDeltas: payload.pendingNeedDeltas ?? defaultState.pendingNeedDeltas,
        awareness: payload.awareness ?? 0,
        awarenessBaseline: payload.awarenessBaseline ?? defaultState.awarenessBaseline,
        awarenessDynamicBuffer:
          payload.awarenessDynamicBuffer ?? defaultState.awarenessDynamicBuffer,
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

  useEffect(() => {
    const el = hudRef.current
    if (!el) return
    const publish = () => {
      const h = Math.ceil(el.getBoundingClientRect().height)
      if (h > 0) {
        setHudHeight(h)
        EventBus.emit('hud-chrome-height', h)
      }
    }
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(publish)
    })
    ro.observe(el)
    publish()
    return () => ro.disconnect()
  }, [portrait])

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

  const setConsciousnessLevelModifier = (nextLevel) => {
    const v = Number(nextLevel)
    if (!Number.isFinite(v)) return
    const level = Math.max(0, Math.min(4, v | 0))
    setConsciousnessLevel(level)
    setConsciousnessLevelUi(level)
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 8,
          right: 8,
          zIndex: 50,
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
            background: 'rgba(20,20,20,0.9)',
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
              background: 'rgba(20,20,20,0.9)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: '#b0b0b0' }}>Consciousness</span>
          <select
            value={consciousnessLevel}
            onChange={(e) => setConsciousnessLevelModifier(e.target.value)}
            style={{
              fontSize: 12,
              padding: '4px 8px',
              background: 'rgba(20,20,20,0.9)',
              border: '1px solid #444',
              borderRadius: 6,
              color: '#e8e8e8',
              cursor: 'pointer'
            }}
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
      </div>

      <div
        ref={hudRef}
        className="game-hud-dock"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: portrait ? '58vh' : '42vh',
          background: 'rgba(18,18,22,0.98)',
          borderTop: '1px solid #3a3a44',
          boxSizing: 'border-box',
          overflow: 'hidden',
          pointerEvents: 'auto'
        }}
      >
        <AwarenessStrip
          awarenessBaseline={state.awarenessBaseline}
          awarenessDynamicBuffer={state.awarenessDynamicBuffer}
        />
        {portrait ? (
          <>
            <NeedsPanel
              needs={state.needs}
              pendingNeedDeltas={state.pendingNeedDeltas}
              onOpenTraits={() => setTraitsModalOpen(true)}
              portrait
            />
            <ReasoningPanel text={state.reasoningText} portrait />
            <GameClockPanel display={state.gameClockDisplay} portrait />
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
              minHeight: NEEDS_PANEL_HEIGHT,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden'
            }}
          >
            <NeedsPanel
              needs={state.needs}
              pendingNeedDeltas={state.pendingNeedDeltas}
              onOpenTraits={() => setTraitsModalOpen(true)}
              portrait={false}
            />
            <ReasoningPanel text={state.reasoningText} portrait={false} />
            <GameClockPanel display={state.gameClockDisplay} portrait={false} />
          </div>
        )}
      </div>

      <AbilityBar
        signalCooldownsMs={state.signalCooldownsMs}
        avatarPhase={state.avatarPhase}
        hudHeight={hudHeight}
      />
      <TraitsModal
        open={traitsModalOpen}
        traits={state.traits}
        onClose={() => setTraitsModalOpen(false)}
      />
    </>
  )
}
