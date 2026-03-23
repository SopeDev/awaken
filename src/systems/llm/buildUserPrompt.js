/**
 * User message body for the decision LLM — situational context in plain language.
 */

import { buildNeedsDescription } from './needsLanguage.js'
import { buildTraitsDescription, flattenTraits } from './traitLanguage.js'
import { describePlayerSignal } from './playerSignalLanguage.js'
import { getActionLabel } from '../../data/actions.js'

const PLAIN_LANGUAGE_NOTE =
  'Context is in plain language only — no numbers, no game terms.'

/** Recent action IDs shown in the prompt, by consciousness level. */
const RECENT_ACTIONS_LIMIT_BY_LEVEL = [3, 5, 8, 8, 10, 10]

function recentActionsLimit(consciousnessLevel) {
  const lv = Math.max(0, Math.min(5, Number(consciousnessLevel) | 0))
  return RECENT_ACTIONS_LIMIT_BY_LEVEL[lv]
}

function formatRecentActions(ids, limit) {
  if (!ids || !ids.length) return null
  const slice = ids.slice(-limit)
  const labels = slice.map((id) => getActionLabel(id) || id)
  return `What I have been doing: ${labels.join(', ')}`
}

function formatRecentFeltOutcomes(lines, limit) {
  const list = Array.isArray(lines) ? lines.map((x) => String(x || '').trim()).filter(Boolean) : []
  if (!list.length) return null
  const slice = list.slice(-limit)
  return `How recent actions have actually felt:\n- ${slice.join('\n- ')}`
}

function formatLoopHint(loopHint) {
  const t = String(loopHint || '').trim()
  if (!t) return null
  return `Loop hint:\n${t}`
}

function formatPatternSummaries(lines, limit) {
  const list = Array.isArray(lines) ? lines.map((x) => String(x || '').trim()).filter(Boolean) : []
  if (!list.length) return null
  const slice = list.slice(-limit)
  return `Pattern summaries:\n- ${slice.join('\n- ')}`
}

function formatAvailableActions(availableActions, salientActionIds) {
  const ids = availableActions || []
  const salient = new Set(
    Array.isArray(salientActionIds) ? salientActionIds.map((id) => String(id)) : []
  )
  const lines = ids.length
    ? ids
        .map((id) => {
          const s = String(id)
          return salient.has(s) ? `- ${s} *` : `- ${s}`
        })
        .join('\n')
    : '- (none)'
  return `Available actions (choose one ID exactly; listed A–Z):\n${lines}`
}

/**
 * @param {object} raw
 * @param {number} raw.consciousnessLevel
 * @param {Record<string, number>} raw.needs
 * @param {Record<string, number>|object} raw.traits flat or grouped
 * @param {string[]} raw.availableActions
 * @param {string|null} [raw.playerSignal]
 * @param {string|null} [raw.playerSignalNote] explicit first-person line (takes precedence over playerSignal id)
 * @param {string[]} [raw.recentActions]
 * @param {string|null} [raw.feltOutcomeLine] one-line subjective summary of the previous action result
 * @param {string[]|null} [raw.recentFeltOutcomes] recent subjective outcomes from completed actions
 * @param {string|null} [raw.loopHint] optional lightweight loop hint
 * @param {string[]|null} [raw.patternSummaries] optional compact pattern summaries
 * @param {string|null} [raw.significantMemory]
 * @param {Record<string, number>|null} [raw.traitTensions] optional, from cosmic breakdown
 * @param {string[]} [raw.salientActionIds] directional-pull targets only; shown as "id *" in the list
 */
export function buildUserPromptContent(raw) {
  const consciousnessLevel = Number(raw.consciousnessLevel) || 0
  const needsDesc = buildNeedsDescription(raw.needs || {}, consciousnessLevel)
  const traitsDesc = buildTraitsDescription(
    consciousnessLevel,
    raw.traits || {},
    raw.traitTensions ?? null
  )
  const explicitNote =
    raw.playerSignalNote != null && String(raw.playerSignalNote).trim()
      ? String(raw.playerSignalNote).trim()
      : null
  const playerBit = explicitNote || describePlayerSignal(raw.playerSignal)
  const recent = formatRecentActions(
    raw.recentActions,
    recentActionsLimit(consciousnessLevel)
  )
  const mem = raw.significantMemory && String(raw.significantMemory).trim()
  const feltOutcomeLine =
    raw.feltOutcomeLine != null && String(raw.feltOutcomeLine).trim()
      ? String(raw.feltOutcomeLine).trim()
      : null
  const feltOutcomesLimit = consciousnessLevel >= 4 ? 5 : (consciousnessLevel >= 3 ? 3 : 0)
  const feltOutcomes = feltOutcomesLimit > 0
    ? formatRecentFeltOutcomes(raw.recentFeltOutcomes, feltOutcomesLimit)
    : null
  const loopHint = consciousnessLevel >= 3 ? formatLoopHint(raw.loopHint) : null
  const patternSummaries = consciousnessLevel >= 4
    ? formatPatternSummaries(raw.patternSummaries, 2)
    : null

  const parts = [PLAIN_LANGUAGE_NOTE]

  if (consciousnessLevel === 0) {
    parts.push(needsDesc)
  } else {
    parts.push(`How I feel: ${needsDesc}`)
  }

  if (traitsDesc) parts.push(traitsDesc)
  if (playerBit) parts.push(playerBit)
  if (feltOutcomeLine) parts.push(`What happened when I did that:\n${feltOutcomeLine}`)
  if (feltOutcomes) parts.push(feltOutcomes)
  if (loopHint) parts.push(loopHint)
  if (patternSummaries) parts.push(patternSummaries)
  if (mem) parts.push(mem)
  if (recent) parts.push(recent)

  parts.push(
    formatAvailableActions(raw.availableActions, raw.salientActionIds)
  )

  return parts.join('\n\n')
}

export { flattenTraits }
