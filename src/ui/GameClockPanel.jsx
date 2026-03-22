import { NEEDS_PANEL_HEIGHT, REASONING_PANEL_PADDING } from '../constants/uiLayout.js'

const clockFont = "'Share Tech Mono', ui-monospace, 'Cascadia Mono', 'Consolas', monospace"

export function GameClockPanel({ display = '7:00 AM', portrait = false }) {
  if (portrait) {
    return (
      <div
        style={{
          width: '100%',
          flexShrink: 0,
          padding: '10px 12px',
          borderTop: '1px solid #444',
          background: 'linear-gradient(180deg, #1a1c18 0%, #0d0f0c 100%)',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
        }}
      >
        <div
          style={{
            fontFamily: clockFont,
            fontSize: 18,
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

  const clockSize = NEEDS_PANEL_HEIGHT

  return (
    <div
      style={{
        width: clockSize,
        height: clockSize,
        flex: '0 0 auto',
        aspectRatio: '1 / 1',
        background: 'linear-gradient(180deg, #1a1c18 0%, #0d0f0c 100%)',
        borderLeft: '1px solid #444',
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
