import { NEED_LABELS } from '../systems/needs/ui.js'
import { getNeedFillColor } from '../systems/needs/ui.js'

function hexToCss(hex) {
  const n = typeof hex === 'number' ? hex : 0x4a7c59
  return '#' + n.toString(16).padStart(6, '0')
}

export function NeedBar({ needKey, value = 0, pendingDelta, fluid = false }) {
  const label = NEED_LABELS[needKey] || needKey
  const pct = Math.max(0, Math.min(100, value)) / 100
  const color = hexToCss(getNeedFillColor(needKey, value))
  const showLeft = typeof pendingDelta === 'number' && pendingDelta < 0
  const showRight = typeof pendingDelta === 'number' && pendingDelta > 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 16, gap: 4 }}>
      <span style={{ fontSize: 12, color: '#b0b0b0', width: 88, flexShrink: 0 }}>{label}</span>
      {showLeft ? (
        <span style={{ fontSize: 11, color: '#e8c84a', textShadow: '0 0 4px #e8c84a', width: 18, textAlign: 'right' }}>
          &lt;&lt;
        </span>
      ) : (
        <span style={{ width: 18 }} />
      )}
      <div
        style={{
          width: fluid ? undefined : 180,
          flex: fluid ? 1 : undefined,
          minWidth: fluid ? 80 : undefined,
          maxWidth: fluid ? 240 : undefined,
          height: 12,
          background: '#2a2a2a',
          borderRadius: 1,
          overflow: 'hidden',
          flexShrink: fluid ? 1 : 0
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: color,
            transition: 'width 0.1s ease-out'
          }}
        />
      </div>
      {showRight ? (
        <span style={{ fontSize: 11, color: '#e8c84a', textShadow: '0 0 4px #e8c84a', width: 18, textAlign: 'left' }}>
          &gt;&gt;
        </span>
      ) : (
        <span style={{ width: 18 }} />
      )}
    </div>
  )
}
