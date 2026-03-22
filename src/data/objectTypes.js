/**
 * Global object type registry. Same object types can appear in multiple scenes/layouts.
 * Each type has a canonical id and default grid size (used when building layout instances).
 */

export const OBJECT_TYPES = {
  bed: { gridW: 3, gridH: 2 },
  phone: { gridW: 1, gridH: 1, hasHiddenDepth: true },
  tv: { gridW: 1, gridH: 2, hasHiddenDepth: true },
  treadmill: { gridW: 2, gridH: 1 },
  computer: { gridW: 1, gridH: 2, hasHiddenDepth: true },
  books: { gridW: 2, gridH: 1, hasHiddenDepth: true },
  window: { gridW: 2, gridH: 1, hasHiddenDepth: true },
  door: { gridW: 1, gridH: 1 },
  refrigerator: { gridW: 1, gridH: 1 },
  couch: { gridW: 1, gridH: 2, hasHiddenDepth: true },
  water_dispenser: { gridW: 1, gridH: 1 },
  shower: { gridW: 2, gridH: 1 },
  toilet: { gridW: 1, gridH: 1 },
  sink: { gridW: 1, gridH: 1 }
}

export const OBJECT_TYPE_IDS = Object.keys(OBJECT_TYPES)

export function getObjectType(id) {
  return OBJECT_TYPES[id] || null
}
