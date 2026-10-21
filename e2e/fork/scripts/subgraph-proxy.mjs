// Time-travel proxy for the fork lane: forwards every GraphQL request to the
// production Index subgraph and drops entities indexed after the fork block, so
// the UI's history agrees with the fork's state instead of knowing the future.
//
//   FORK_BLOCK=119967348 UPSTREAM=https://... node e2e/fork/scripts/subgraph-proxy.mjs
import { createServer } from 'node:http'

const forkBlock = BigInt(process.env.FORK_BLOCK ?? '0')
const upstream = process.env.UPSTREAM
const port = Number(process.env.PORT ?? 18300)
if (!forkBlock || !upstream) throw new Error('FORK_BLOCK and UPSTREAM are required')

let dropped = 0
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
    const json = await upstreamRes.json()
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
