// Persistent character state shared across Phaser scenes.

const characterState = {
  // 0–5 per awaken.md Consciousness Level system.
  consciousnessLevel: 0
}

export function getCharacterState() {
  return characterState
}

export function setConsciousnessLevel(level) {
  const x = Number(level)
  if (!Number.isFinite(x)) return
  characterState.consciousnessLevel = Math.max(0, Math.min(5, x | 0))
}

