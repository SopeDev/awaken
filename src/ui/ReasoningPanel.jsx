import { NEEDS_PANEL_HEIGHT, REASONING_PANEL_PADDING, getReasoningAndClockLayout } from '../constants/uiLayout.js'

export function ReasoningPanel({ text = 'Waiting for next decision…' }) {
  const { reasoningLeft, reasoningWidth, panelTop } = getReasoningAndClockLayout()

  return (
    <div
      style={{
        position: 'absolute',
        left: reasoningLeft,
        top: panelTop + REASONING_PANEL_PADDING,
        width: reasoningWidth,
        height: NEEDS_PANEL_HEIGHT - REASONING_PANEL_PADDING * 2,
        background: 'rgba(37,37,37,0.95)',
        borderLeft: '1px solid #444',
        padding: REASONING_PANEL_PADDING,
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8, flexShrink: 0 }}>Avatar's reasoning</div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          fontSize: 12,
          color: '#c0c0c0',
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {text}
      </div>
    </div>
  )
}
