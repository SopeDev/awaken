import { NEED_KEYS } from '../systems/needs/constants.js'
import { NeedBar } from './NeedBar.jsx'
import { GAME_HEIGHT, NEEDS_PANEL_HEIGHT, MENU_WIDTH, REASONING_PANEL_PADDING } from '../constants/uiLayout.js'

const panelTop = GAME_HEIGHT - NEEDS_PANEL_HEIGHT
const menuLeft = REASONING_PANEL_PADDING + 8
const needsLeft = menuLeft + MENU_WIDTH

export function NeedsPanel({ needs = {}, pendingNeedDeltas = {}, onOpenTraits }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: panelTop,
        width: needsLeft + 400,
        height: NEEDS_PANEL_HEIGHT,
        display: 'flex',
        alignItems: 'flex-start',
        pointerEvents: 'auto'
      }}
    >
      <button
        type="button"
        onClick={onOpenTraits}
        onMouseOver={(e) => (e.currentTarget.style.color = '#e0e0e0')}
        onMouseOut={(e) => (e.currentTarget.style.color = '#b0b0b0')}
        style={{
          position: 'absolute',
          left: menuLeft -8,
          top: NEEDS_PANEL_HEIGHT / 2 - 60,
          width: MENU_WIDTH - 8,
          height: NEEDS_PANEL_HEIGHT - 100,
          margin: 0,
          padding: '0 0 4px 0',
          border: '1px solid #444',
          background: 'transparent',
          color: '#b0b0b0',
          fontSize: 28,
          cursor: 'pointer',
          lineHeight: 1
        }}
        aria-label="Character traits"
      >
        ☺
      </button>
      <div style={{ position: 'absolute', left: needsLeft, top: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NEED_KEYS.map((key, i) => (
          <NeedBar
            key={key}
            needKey={key}
            value={needs[key]}
            pendingDelta={pendingNeedDeltas[key]}
          />
        ))}
      </div>
    </div>
  )
}
