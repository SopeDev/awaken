import { getActionLabel } from '../../data/actions.js'

import { SYNCHRONICITY_NOTE_BY_ACTION_ID } from '../../data/objectTypes.js'

export function getAttuneNoteForAction(actionId) {
  if (SYNCHRONICITY_NOTE_BY_ACTION_ID[actionId]) return SYNCHRONICITY_NOTE_BY_ACTION_ID[actionId]
  const label = getActionLabel(actionId)
  return `*While I ${label}, something small and strange prickles at the edge of my attention*`
}

export const getSynchronicityNoteForAction = getAttuneNoteForAction
