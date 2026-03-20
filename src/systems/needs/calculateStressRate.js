/**
 * Stress rate per game-minute — dynamic from needs, traits, and active Archon.
 * awaken.md section 10.3.
 */

export function calculateStressRate(needs, traits, activeArchon = null) {
  let rate = 0

  if (needs.hunger > 70) rate += 1.2
  if (needs.thirst > 65) rate += 1.5
  if (needs.energy < 25) rate += 0.8
  if (needs.boredom > 75) rate += 0.6

  // Retired traits v1 are now emergent from new traits:
  // - anxiety → low courage + low resilience + high desire
  // - stability → resilience
  const courage = getTraitValue(traits, 'courage')
  const resilience = getTraitValue(traits, 'resilience')
  const desire = getTraitValue(traits, 'desire')

  const anxietyEmergent = (100 - (courage ?? 50)) * 0.4 + (100 - (resilience ?? 50)) * 0.4 + (desire ?? 50) * 0.2
  const anxietyFactor = (anxietyEmergent - 50) / 100
  const stabilityFactor = ((resilience ?? 50) - 50) / 100

  rate += anxietyFactor * 0.8
  rate -= stabilityFactor * 0.6

  if (activeArchon === 'fear') rate += 2.0
  if (activeArchon === 'distraction') rate += 0.8
  if (activeArchon === 'control') rate += 1.2
  if (activeArchon === 'desire') rate += 1.0
  if (activeArchon === 'doubt') rate += 0.8

  return rate
}

function getTraitValue(traits, key) {
  if (!traits) return null
  if (typeof traits[key] === 'number') return traits[key]
  for (const element of ['fire', 'air', 'water', 'earth']) {
    if (traits[element] && typeof traits[element][key] === 'number') {
      return traits[element][key]
    }
  }
  return null
}
