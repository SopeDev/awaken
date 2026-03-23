import { NEED_KEYS } from '../systems/needs/constants.js'
import { NeedBar } from './NeedBar.jsx'
import { MENU_WIDTH } from '../constants/uiLayout.js'

export function NeedsPanel({
  needs = {},
  pendingNeedDeltas = {},
  onOpenTraits,
  portrait = false
}) {
  if (portrait) {
    return (
      <div
        style={{
          width: '100%',
          flexShrink: 0,
          padding: '10px 12px',
          borderTop: '1px solid #333',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
          pointerEvents: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <button
          type="button"
          onClick={onOpenTraits}
          onMouseOver={(e) => (e.currentTarget.style.color = '#e0e0e0')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#b0b0b0')}
          style={{
            flexShrink: 0,
            width: MENU_WIDTH - 8,
          height: 40,
            margin: 0,
          padding: 0,
          paddingBottom: 5,
            border: '1px solid #444',
            background: 'transparent',
            color: '#b0b0b0',
            fontSize: 26,
            cursor: 'pointer',
            lineHeight: 1
          }}
          aria-label="Character traits"
        >
          ☺
        </button>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {NEED_KEYS.map((key) => (
            <NeedBar
              key={key}
              needKey={key}
              value={needs[key]}
              pendingDelta={pendingNeedDeltas[key]}
              fluid
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        flex: '1 1 280px',
        minWidth: 0,
        maxWidth: 'min(360px, 42vw)',
        minHeight: 120,
        padding: '8px 10px',
        borderRight: '1px solid #444',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        overflow: 'hidden',
        pointerEvents: 'auto'
      }}
    >
      <button
        type="button"
        onClick={onOpenTraits}
        onMouseOver={(e) => (e.currentTarget.style.color = '#e0e0e0')}
        onMouseOut={(e) => (e.currentTarget.style.color = '#b0b0b0')}
        style={{
          flexShrink: 0,
          width: MENU_WIDTH - 8,
          height: 40,
          margin: 0,
          padding: 0,
          paddingBottom: 5,
          border: '1px solid #444',
          background: 'transparent',
          color: '#b0b0b0',
          fontSize: 26,
          cursor: 'pointer',
          lineHeight: 1
        }}
        aria-label="Character traits"
      >
        ☺
      </button>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {NEED_KEYS.map((key) => (
          <NeedBar
            key={key}
            needKey={key}
            value={needs[key]}
            pendingDelta={pendingNeedDeltas[key]}
            fluid
          />
        ))}
      </div>
    </div>
  )
}
