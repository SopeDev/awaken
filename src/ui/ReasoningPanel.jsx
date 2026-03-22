import { NEEDS_PANEL_HEIGHT, REASONING_PANEL_PADDING } from '../constants/uiLayout.js'

export function ReasoningPanel({ text = 'Waiting for next decision…', portrait = false }) {
  if (portrait) {
    return (
      <div
        style={{
          width: '100%',
          flex: 1,
          minHeight: 72,
          maxHeight: 200,
          background: 'rgba(37,37,37,0.95)',
          borderTop: '1px solid #444',
          padding: REASONING_PANEL_PADDING,
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6, flexShrink: 0 }}>Avatar's reasoning</div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            fontSize: 12,
            color: '#c0c0c0',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {text}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 0,
        marginLeft: 0,
        height: NEEDS_PANEL_HEIGHT,
        background: 'rgba(37,37,37,0.95)',
        borderLeft: '1px solid #444',
        padding: REASONING_PANEL_PADDING,
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
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
