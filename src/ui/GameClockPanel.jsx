import {
  NEEDS_PANEL_HEIGHT,
  REASONING_PANEL_PADDING,
  getReasoningAndClockLayout
} from '../constants/uiLayout.js'

const clockFont = "'Share Tech Mono', ui-monospace, 'Cascadia Mono', 'Consolas', monospace"

export function GameClockPanel({ display = '7:00 AM' }) {
  const { clockLeft, clockWidth, panelTop } = getReasoningAndClockLayout()

  return (
    <div
      style={{
        position: 'absolute',
        left: clockLeft,
        top: panelTop + REASONING_PANEL_PADDING,
        width: clockWidth,
        height: NEEDS_PANEL_HEIGHT - REASONING_PANEL_PADDING * 2,
        background: 'linear-gradient(180deg, #1a1c18 0%, #0d0f0c 100%)',
        border: '1px solid #2a3328',
        borderRadius: 4,
        padding: REASONING_PANEL_PADDING,
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
      }}
    >
      <div
        style={{
          fontFamily: clockFont,
          fontSize: 17,
          fontWeight: 400,
          color: '#5ee87a',
          letterSpacing: '0.06em',
          fontVariantNumeric: 'tabular-nums',
          textShadow:
            '0 0 6px rgba(94, 232, 122, 0.45), 0 0 14px rgba(94, 232, 122, 0.2)',
          lineHeight: 1.2
        }}
      >
        {display.toUpperCase()}
      </div>
    </div>
  )
}
