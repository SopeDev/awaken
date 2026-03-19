const TRAIT_FULL_NAMES = {
  courage: 'Courage',
  discipline: 'Discipline',
  impulsiveness: 'Impulsiveness',
  logic: 'Logic',
  intuition: 'Intuition',
  curiosity: 'Curiosity',
  empathy: 'Empathy',
  anxiety: 'Anxiety',
  desire: 'Desire',
  stability: 'Stability',
  comfort_seeking: 'Comfort seeking',
  perception: 'Perception'
}

const TRAIT_IDS = Object.keys(TRAIT_FULL_NAMES)

export function TraitsModal({ open, traits = {}, onClose }) {
  if (!open) return null

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000
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
          zIndex: 1001,
          padding: 20
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
              padding: 0
            }}
          >
            ×
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
