/**
 * LLM decision handler — OpenAI or local Ollama. Used by Vite middleware and Vercel /api/decision.
 */

import OpenAI from 'openai'
import { buildUserPromptContent } from '../src/systems/llm/buildUserPrompt.js'
import { getSystemPrompt } from '../src/systems/llm/systemPrompts.js'

const TEMPERATURE = 0.85
const MAX_TOKENS = 200
/** gpt-5* / reasoning-style models use hidden reasoning tokens — tiny limits often yield empty JSON. */
const MAX_COMPLETION_TOKENS_REASONING_MODELS = 4096

/**
 * Models that require max_completion_tokens (not max_tokens) and often fixed temperature.
 * Covers gpt-5-nano, gpt-5-mini, o-series, etc.
 */
function openAiUsesNewChatParams(modelId) {
  const m = String(modelId || '').toLowerCase()
  return (
    m.includes('gpt-5') ||
    m.includes('gpt5') ||
    m.includes('o1') ||
    m.includes('o3') ||
    m.includes('o4')
  )
}

function openAiCompletionTokenLimit(modelId, env) {
  if (!openAiUsesNewChatParams(modelId)) return MAX_TOKENS
  const fromEnv = Number(env?.LLM_MAX_COMPLETION_TOKENS)
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return Math.min(Math.floor(fromEnv), 32000)
  }
  return MAX_COMPLETION_TOKENS_REASONING_MODELS
}

/** Chat message `content` may be a string or an array of { type, text } parts. */
function extractOpenAiAssistantText(message) {
  if (!message) return ''
  const c = message.content
  if (typeof c === 'string') return c
  if (Array.isArray(c)) {
    return c
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part.text === 'string') return part.text
        if (part && part.type === 'text' && typeof part.text === 'string') return part.text
        return ''
      })
      .join('')
  }
  return ''
}

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
    const useNew = openAiUsesNewChatParams(model)
    const tokenLimitKey = useNew ? 'max_completion_tokens' : 'max_tokens'
    const tokenLimit = openAiCompletionTokenLimit(model, env)
    const request = {
      model,
      [tokenLimitKey]: tokenLimit,
      response_format: { type: 'json_object' },
      messages
    }
    // gpt-5-mini / gpt-5-nano: only default temperature (1) — omit custom value.
    if (!useNew) {
      request.temperature = TEMPERATURE
    }
    const completion = await client.chat.completions.create(request)
    const choice = completion.choices[0]
    const msg = choice?.message
    const text = extractOpenAiAssistantText(msg)
    if (!String(text || '').trim()) {
      const refusal = msg && typeof msg.refusal === 'string' ? msg.refusal : ''
      console.warn('[decision] OpenAI returned empty assistant text (no JSON to parse).', {
        model,
        finishReason: choice?.finish_reason,
        usage: completion.usage,
        refusal: refusal || undefined,
        messageKeys: msg && typeof msg === 'object' ? Object.keys(msg) : []
      })
      return {}
    }
    if (choice?.finish_reason === 'length') {
      console.warn('[decision] OpenAI finish_reason=length (output may be truncated). Consider raising LLM_MAX_COMPLETION_TOKENS.', {
        model,
        tokenLimit,
        usage: completion.usage
      })
    }
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

  const systemPrompt = getSystemPrompt(consciousnessLevel)
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
  if (logLlmIo) {
    console.log('[decision] → LLM system prompt\n', systemPrompt)
    console.log('[decision] → LLM user message\n', userContent)
  }

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
