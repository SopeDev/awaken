/**
 * User message body for the decision LLM — all natural language.
 */

import { buildNeedsDescription } from './needsLanguage.js'
import { buildTraitsDescription, flattenTraits } from './traitLanguage.js'
import { describePlayerSignal } from './playerSignalLanguage.js'
import { getActionLabel } from '../../data/actions.js'

function recentActionsText(ids) {
  if (!ids || !ids.length) return null
  const lines = ids.map((id) => {
    const label = getActionLabel(id) || id
    return `${label} (${id})`
  })
  return `What I have been doing lately: ${lines.join('; ')}.`
}

/**
 * @param {object} raw
 * @param {number} raw.consciousnessLevel
 * @param {Record<string, number>} raw.needs
 * @param {Record<string, number>|object} raw.traits flat or grouped
 * @param {string[]} raw.availableActions
 * @param {string|null} [raw.playerSignal]
 * @param {string[]} [raw.recentActions]
 * @param {string|null} [raw.significantMemory]
 * @param {Record<string, number>|null} [raw.traitTensions] optional, from cosmic breakdown
 */
export function buildUserPromptContent(raw) {
  const consciousnessLevel = Number(raw.consciousnessLevel) || 0
  const needsDesc = buildNeedsDescription(raw.needs || {}, consciousnessLevel)
  const traitsDesc =
    consciousnessLevel >= 2
      ? buildTraitsDescription(consciousnessLevel, raw.traits || {}, raw.traitTensions ?? null)
      : null
  const playerBit = describePlayerSignal(raw.playerSignal)
  const recent = recentActionsText(raw.recentActions)
  const mem = raw.significantMemory && String(raw.significantMemory).trim()

  const parts = [`needs_description: ${needsDesc}`]
  if (traitsDesc) parts.push(`traits_description: ${traitsDesc}`)
  parts.push(`available_actions: ${(raw.availableActions || []).join(', ')}`)

  if (playerBit) parts.push(`player_signal: ${playerBit}`)
  if (recent) parts.push(recent)
  if (mem) parts.push(`significant_memory: ${mem}`)

  return parts.join('\n\n')
}

export { flattenTraits }
