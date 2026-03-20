/**
 * LLM decision handler — OpenAI or local Ollama. Used by Vite middleware and Vercel /api/decision.
 */

import OpenAI from 'openai'
import { buildUserPromptContent } from '../src/systems/llm/buildUserPrompt.js'
import { getSystemPrompt } from '../src/systems/llm/systemPrompts.js'

const TEMPERATURE = 0.85
const MAX_TOKENS = 200

function getEnv(options) {
  return options.env || process.env
}

function extractJsonObject(text) {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1].trim() : trimmed
  try {
    return JSON.parse(raw)
  } catch {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

async function callOllama(messages, env) {
  const model = env.LLM_MODEL || 'llama3.2'
  const host = env.OLLAMA_HOST || 'http://127.0.0.1:11434'
  const res = await fetch(`${host.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      format: 'json',
      options: { temperature: TEMPERATURE, num_predict: MAX_TOKENS }
    })
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Ollama error ${res.status}: ${t}`)
  }
  const data = await res.json()
  const content = data.message?.content
  return extractJsonObject(content) || {}
}

async function callOpenAI(messages, env) {
  const apiKey = String(env.OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is missing or empty. Add it to .env.local in the project root (same folder as package.json), then restart `npm run dev`.'
    )
  }
  const model = String(env.LLM_MODEL || 'gpt-4.1-mini').trim()
  const client = new OpenAI({ apiKey })
  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      response_format: { type: 'json_object' },
      messages
    })
    const text = completion.choices[0]?.message?.content || '{}'
    return extractJsonObject(text) || {}
  } catch (err) {
    const base = err?.message || String(err)
    throw new Error(`${base} (model: ${model})`)
  }
}

function normalizeDecision(parsed, availableActions) {
  const safe = parsed && typeof parsed === 'object' ? parsed : {}
  const action = typeof safe.action === 'string' ? safe.action.trim() : ''
  const valid = new Set(availableActions || [])
  let chosen = action && valid.has(action) ? action : null
  if (!chosen && availableActions?.length) {
    console.warn('[decision] Invalid or missing action from LLM; falling back to first available.', {
      received: action,
      available: availableActions
    })
    chosen = availableActions[0]
  }
  const out = {
    action: chosen || '',
    thought: typeof safe.thought === 'string' ? safe.thought : '',
    reason: typeof safe.reason === 'string' ? safe.reason : ''
  }
  const extraKeys = ['unease', 'pattern_noticed', 'signal_response', 'guidance', 'state']
  for (const k of extraKeys) {
    if (safe[k] != null && safe[k] !== '') out[k] = safe[k]
  }
  return out
}

/**
 * @param {object} body
 * @param {object} [options]
 * @param {Record<string, string>} [options.env] merged env for dev
 */
export async function handleDecisionRequest(body, options = {}) {
  const env = getEnv(options)
  const consciousnessLevel = Math.max(0, Math.min(5, Number(body.consciousnessLevel) || 0))
  const availableActions = Array.isArray(body.availableActions) ? body.availableActions.map(String) : []

  const userContent = buildUserPromptContent({
    consciousnessLevel,
    needs: body.needs || {},
    traits: body.traits || {},
    availableActions,
    playerSignal: body.playerSignal ?? null,
    recentActions: body.recentActions || [],
    significantMemory: consciousnessLevel >= 2 ? (body.significantMemory ?? null) : null,
    traitTensions: body.traitTensions ?? null
  })

  const systemPrompt = getSystemPrompt(consciousnessLevel, availableActions)
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ]

  const useLocal =
    String(env.USE_LOCAL_LLM || '').trim() === 'true' ||
    String(env.USE_LOCAL_LLM || '').trim() === '1'
  const modelId = useLocal
    ? String(env.LLM_MODEL || 'llama3.2').trim()
    : String(env.LLM_MODEL || 'gpt-4.1-mini').trim()

  const logLlmIo = String(env.LOG_LLM_IO || 'true').trim() !== 'false'
  const requestBodyForDebug = {
    consciousnessLevel,
    needs: body.needs,
    traits: body.traits,
    traitTensions: body.traitTensions ?? null,
    availableActions,
    playerSignal: body.playerSignal ?? null,
    recentActions: body.recentActions ?? [],
    significantMemory: body.significantMemory ?? null
  }

  const parsed = useLocal ? await callOllama(messages, env) : await callOpenAI(messages, env)

  const normalized = normalizeDecision(parsed, availableActions)
  if (!logLlmIo) return normalized

  return {
    ...normalized,
    _llmDebug: {
      provider: useLocal ? 'ollama' : 'openai',
      modelId,
      requestBody: requestBodyForDebug,
      messages,
      rawParsed: parsed,
      normalized
    }
  }
}
