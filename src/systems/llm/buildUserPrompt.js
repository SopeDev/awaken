/**
 * User message body for the decision LLM — situational context in plain language.
 */

import { buildNeedsDescription } from './needsLanguage.js'
import { buildTraitsDescription, flattenTraits } from './traitLanguage.js'
import { describePlayerSignal } from './playerSignalLanguage.js'
import { getActionLabel, getActionPastPhrase } from '../../data/actions.js'

const PLAIN_LANGUAGE_NOTE =
  'Context is in plain language only — no numbers, no game terms.'

/** Last N completed actions, each with a one-line subjective outcome (plain language). */
const RECENT_ACTIVITY_LINE_COUNT = 3

/** Strip legacy "Watch TV …" prefix so we do not repeat the action before the em dash. */
function normalizeFeltTailForAction(actionId, outcomeLine) {
  const raw = String(outcomeLine || '').trim()
  if (!raw) return ''
  if (raw.toLowerCase().startsWith('it ')) return raw

  const label = getActionLabel(actionId) || String(actionId).replace(/_/g, ' ')
  const cap = label.charAt(0).toUpperCase() + label.slice(1)
  let rest = raw
  if (rest.startsWith(`${cap} `)) rest = rest.slice(cap.length + 1).trim()
  else if (rest.toLowerCase().startsWith(`${label.toLowerCase()} `)) rest = rest.slice(label.length + 1).trim()

  if (!rest.toLowerCase().startsWith('it ')) rest = `it ${rest}`
  return rest
}

function formatRecentActivityWithOutcomes(actionIds, outcomeLines) {
  const ids = Array.isArray(actionIds) ? actionIds.filter(Boolean) : []
  if (!ids.length) return null

  const n = Math.min(RECENT_ACTIVITY_LINE_COUNT, ids.length)
  const idSlice = ids.slice(-n)
  const rawOutcomes = Array.isArray(outcomeLines) ? outcomeLines.map((x) => String(x ?? '').trim()) : []
  let outSlice = rawOutcomes.slice(-n)
  while (outSlice.length < idSlice.length) outSlice.unshift('')

  const lines = idSlice.map((actionId, i) => {
    const past = getActionPastPhrase(actionId) || getActionLabel(actionId) || String(actionId)
    const tail = normalizeFeltTailForAction(actionId, outSlice[i])
    return tail ? `- ${past} — ${tail}` : `- ${past}`
  })
  return `What I have been doing lately:\n${lines.join('\n')}`
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
 * @param {string|null} [raw.feltOutcomeLine] optional; merged into recent activity lines when arrays lag by one tick
 * @param {string[]|null} [raw.recentFeltOutcomes] subjective tails ("it …") per completed action, newest last
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
  const mem = raw.significantMemory && String(raw.significantMemory).trim()
  const feltOutcomeLine =
    raw.feltOutcomeLine != null && String(raw.feltOutcomeLine).trim()
      ? String(raw.feltOutcomeLine).trim()
      : null

  let outcomeLinesForActivity = Array.isArray(raw.recentFeltOutcomes)
    ? [...raw.recentFeltOutcomes]
    : []
  const actionIdsForActivity = Array.isArray(raw.recentActions) ? [...raw.recentActions] : []
  if (
    feltOutcomeLine &&
    actionIdsForActivity.length === outcomeLinesForActivity.length + 1
  ) {
    outcomeLinesForActivity = [...outcomeLinesForActivity, feltOutcomeLine]
  }
  const recentActivity = formatRecentActivityWithOutcomes(
    actionIdsForActivity,
    outcomeLinesForActivity
  )
  const loopHint = consciousnessLevel >= 3 ? formatLoopHint(raw.loopHint) : null
  const patternSummaries = consciousnessLevel >= 4
    ? formatPatternSummaries(raw.patternSummaries, 2)
    : null

  const parts = [PLAIN_LANGUAGE_NOTE]

  parts.push(`How I feel:\n${needsDesc}`)

  if (traitsDesc) parts.push(`How I tend to be:\n${traitsDesc}`)
  if (recentActivity) parts.push(recentActivity)
  else if (feltOutcomeLine) {
    const tail = normalizeFeltTailForAction('', feltOutcomeLine)
    if (tail) parts.push(`What happened:\n${tail}`)
  }
  if (playerBit) parts.push(playerBit)
  if (loopHint) parts.push(loopHint)
  if (patternSummaries) parts.push(patternSummaries)
  if (mem) parts.push(mem)

  parts.push(
    formatAvailableActions(raw.availableActions, raw.salientActionIds)
  )

  return parts.join('\n\n')
}

export { flattenTraits }
