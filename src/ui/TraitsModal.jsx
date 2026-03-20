import { getCharacterState } from '../systems/character/characterState.js'

const TRAIT_FULL_NAMES = {
  courage: 'Courage',
  discipline: 'Discipline',
  expressiveness: 'Expressiveness',
  logic: 'Logic',
  intuition: 'Intuition',
  curiosity: 'Curiosity',
  empathy: 'Empathy',
  desire: 'Desire',
  introspection: 'Introspection',
  resilience: 'Resilience',
  imagination: 'Imagination',
  perception: 'Perception'
}

const TRAIT_IDS = Object.keys(TRAIT_FULL_NAMES)

export function TraitsModal({ open, traits = {}, onClose }) {
  if (!open) return null
  const { consciousnessLevel } = getCharacterState()

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 2000,
          pointerEvents: 'auto'
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="traits-modal-title"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 320,
          maxHeight: '80vh',
          overflow: 'auto',
          background: '#252525',
          border: '1px solid #444',
          borderRadius: 4,
          zIndex: 2001,
          padding: 20,
          pointerEvents: 'auto',
          userSelect: 'text',
          WebkitUserSelect: 'text'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 id="traits-modal-title" style={{ fontSize: 16, color: '#e0e0e0', margin: 0 }}>
            Character traits
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: '#b0b0b0',
              fontSize: 20,
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
              pointerEvents: 'auto'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#c0c0c0' }}>Consciousness</span>
            <span style={{ color: '#e8c84a' }}>{consciousnessLevel}/5</span>
          </div>
          <div style={{ height: 1, background: '#444', width: '100%', marginTop: 2, marginBottom: 2 }} />
          {TRAIT_IDS.map((key) => {
            const v = traits[key] != null ? traits[key] : 50
            const label = TRAIT_FULL_NAMES[key] || key
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13
                }}
              >
                <span style={{ color: '#c0c0c0' }}>{label}</span>
                <span style={{ color: '#e8c84a' }}>{Math.round(v)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
