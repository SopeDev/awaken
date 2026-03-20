import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/** Plain .env parser so /api/decision always sees keys from .env.local (vite loadEnv can miss edge cases). */
function parseEnvFile(filePath) {
  const out = {}
  if (!existsSync(filePath)) return out
  const text = readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

export default defineConfig(({ mode }) => {
  const cwd = process.cwd()
  const envFromVite = loadEnv(mode, cwd, '')
  const envFromFiles = {
    ...parseEnvFile(resolve(cwd, '.env')),
    ...parseEnvFile(resolve(cwd, '.env.local')),
    ...parseEnvFile(resolve(cwd, `.env.${mode}`)),
    ...parseEnvFile(resolve(cwd, `.env.${mode}.local`))
  }
  const env = { ...envFromVite, ...envFromFiles }

  return {
    plugins: [
      react(),
      {
        name: 'decision-api-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const path = req.url?.split('?')[0]
            if (path !== '/api/decision' || req.method !== 'POST') {
              return next()
            }
            let body = ''
            req.on('data', (chunk) => { body += chunk })
            req.on('end', async () => {
              try {
                const json = JSON.parse(body || '{}')
                const { handleDecisionRequest } = await import('./server/decisionHandler.js')
                const merged = { ...process.env, ...env }
                const out = await handleDecisionRequest(json, { env: merged })
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(out))
              } catch (e) {
                console.error('[vite] /api/decision failed:', e.message || e)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: e.message || 'decision failed' }))
              }
            })
            req.on('error', () => {
              res.statusCode = 500
              res.end()
            })
          })
        }
      }
    ],
    root: '.',
    publicDir: 'public'
  }
})
