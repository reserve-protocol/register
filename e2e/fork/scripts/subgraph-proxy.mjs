// Time-travel proxy for the fork lane: forwards every GraphQL request to the
// production Index subgraph and drops entities indexed after the fork block, so
// the UI's history agrees with the fork's state instead of knowing the future.
//
//   FORK_BLOCK=119967348 UPSTREAM=https://... node e2e/fork/scripts/subgraph-proxy.mjs
//
// OVERLAY=<json> (written by governance-overlay.mjs) shows a governance change made on the fork,
// which the upstream subgraph never indexed: for the overlaid DTF, ownerGovernance and
// tradingGovernance come from a template DTF on the same governor version, stToken from a DTF on
// the target vault, and the ids and parameters are then replaced with the fork's on-chain values.
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'

const forkBlock = BigInt(process.env.FORK_BLOCK ?? '0')
const upstream = process.env.UPSTREAM
const port = Number(process.env.PORT ?? 18300)
if (!forkBlock || !upstream) throw new Error('FORK_BLOCK and UPSTREAM are required')

let dropped = 0
const overlayPath = process.env.OVERLAY
const loadOverlay = () => (overlayPath && existsSync(overlayPath) ? JSON.parse(readFileSync(overlayPath, 'utf8')) : null)

const fetchUpstream = async (body) =>
  (await fetch(upstream, { method: 'POST', headers: { 'content-type': 'application/json' }, body })).json()

const findDtf = (value, id) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDtf(item, id)
      if (found) return found
    }
  } else if (value && typeof value === 'object') {
    if (typeof value.id === 'string' && value.id.toLowerCase() === id) return value
    for (const child of Object.values(value)) {
      const found = findDtf(child, id)
      if (found) return found
    }
  }
  return undefined
}

const patchGovernance = (governance, overlay) => {
  if (!governance || typeof governance !== 'object') return governance
  const patched = { ...governance }
  for (const [key, value] of Object.entries(overlay.governance.fields)) if (key in patched) patched[key] = value
  if ('id' in patched) patched.id = overlay.governance.id
  if (patched.timelock && typeof patched.timelock === 'object') {
    patched.timelock = { ...patched.timelock }
    if ('id' in patched.timelock) patched.timelock.id = overlay.governance.timelock
    if ('entity' in patched.timelock) patched.timelock.entity = overlay.dtf
    for (const [key, value] of Object.entries(overlay.governance.timelockFields ?? {}))
      if (key in patched.timelock) patched.timelock[key] = value
  }
  return patched
}

// Re-runs the same query for a template DTF and splices its governance and vault subtrees into the overlaid DTF.
const applyOverlay = async (body, json, overlay) => {
  const target = findDtf(json?.data, overlay.dtf)
  if (!target) return json
  const swap = (templateId) => body.toString().replace(new RegExp(overlay.dtf, 'gi'), templateId)
  const [governanceTemplate, vaultTemplate] = await Promise.all(
    [overlay.governanceFrom, overlay.stTokenFrom].map(async (id) => findDtf((await fetchUpstream(swap(id))).data, id))
  )
  for (const key of ['ownerGovernance', 'tradingGovernance']) {
    if (!(key in target)) continue
    const governance = patchGovernance(governanceTemplate?.[key], overlay)
    // The governance's vote token is the target vault, which the vault template carries.
    if (governance && 'token' in governance) governance.token = vaultTemplate?.[key]?.token ?? governance.token
    target[key] = governance
  }
  if ('stToken' in target) target.stToken = vaultTemplate?.stToken
  if ('stTokenAddress' in target) target.stTokenAddress = vaultTemplate?.stTokenAddress
  for (const [key, value] of Object.entries(overlay.dtfFields ?? {})) if (key in target) target[key] = value
  overlaid += 1
  return json
}
let overlaid = 0
const truncate = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => {
        const block = item && typeof item === 'object' && 'blockNumber' in item ? item.blockNumber : undefined
        if (block !== undefined && block !== null && /^\d+$/.test(String(block)) && BigInt(block) > forkBlock) {
          dropped += 1
          return false
        }
        return true
      })
      .map(truncate)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, truncate(v)]))
  }
  return value
}

createServer(async (req, res) => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = Buffer.concat(chunks)
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-headers', '*')
  if (req.method === 'OPTIONS') return res.end()
  try {
    const upstreamRes = await fetch(upstream, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    })
    const overlay = loadOverlay()
    const json = overlay ? await applyOverlay(body, await upstreamRes.json(), overlay) : await upstreamRes.json()
    const before = dropped
    const out = truncate(json)
    if (dropped > before) console.log(`[subgraph-proxy] dropped ${dropped - before} post-fork entities`)
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(out))
  } catch (error) {
    res.statusCode = 502
    res.end(JSON.stringify({ errors: [{ message: String(error) }] }))
  }
}).listen(port, '127.0.0.1', () => console.log(`[subgraph-proxy] 127.0.0.1:${port} → upstream, truncated at block ${forkBlock}`))
