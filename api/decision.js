/**
 * Vercel serverless: POST /api/decision
 */

import { handleDecisionRequest } from '../server/decisionHandler.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const out = await handleDecisionRequest(body)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json(out)
  } catch (e) {
    console.error('[api/decision]', e)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({ error: e.message || 'Decision handler failed' })
  }
}
