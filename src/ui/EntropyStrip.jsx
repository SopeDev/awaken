import { GAME_WIDTH, GAME_HEIGHT, ENTROPY_STRIP_HEIGHT, NEEDS_PANEL_HEIGHT } from '../constants/uiLayout.js'

const PADDING = 18
const LABEL_WIDTH = 56
const BAR_GAP = 8

function entropyColor(entropy) {
  if (entropy >= 70) return '#a55a5a'
  if (entropy >= 40) return '#8a8a3a'
  return '#4a7c59'
}

export function EntropyStrip({ entropy = 0 }) {
  const stripTop = GAME_HEIGHT - NEEDS_PANEL_HEIGHT - ENTROPY_STRIP_HEIGHT
  const barMaxWidth = GAME_WIDTH - PADDING - LABEL_WIDTH - BAR_GAP - PADDING
  const pct = Math.max(0, Math.min(100, entropy)) / 100

  return (
    <div
      className="entropy-strip"
      style={{
        position: 'absolute',
        left: 0,
        top: stripTop,
        width: GAME_WIDTH,
        height: ENTROPY_STRIP_HEIGHT,
        background: 'rgba(26,26,26,0.95)',
        borderTop: '2px solid #444',
        borderBottom: '2px solid #444',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: PADDING,
        paddingRight: PADDING,
        boxSizing: 'border-box'
      }}
    >
      <span style={{ fontSize: 12, color: '#b0b0b0', width: LABEL_WIDTH }}>Entropy</span>
      <div
        style={{
          marginLeft: BAR_GAP,
          flex: 1,
          height: 14,
          background: '#2a2a2a',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: entropyColor(entropy),
            transition: 'width 0.15s ease-out'
          }}
        />
      </div>
    </div>
  )
}
