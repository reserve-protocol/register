import { createHash } from 'node:crypto'
import { writeFile } from 'node:fs/promises'

const url = 'https://api.reserve.org/dtf/daos'
const response = await fetch(url)
if (!response.ok) throw new Error(`DAO capture failed: ${response.status}`)
const data = await response.json()
if (!Array.isArray(data) || !data.length)
  throw new Error('Expected a populated DAO array')
const payload = JSON.stringify(data, null, 2) + '\n'
await writeFile(new URL('./daos.json', import.meta.url), payload)
await writeFile(
  new URL('./daos-meta.json', import.meta.url),
  JSON.stringify(
    {
      source: url,
      capturedAt: new Date().toISOString(),
      sha256: createHash('sha256').update(payload).digest('hex'),
      purpose:
        'Public API replay for source inspection, not live financial truth',
      count: data.length,
    },
    null,
    2
  ) + '\n'
)
console.log(
  JSON.stringify(
    data.map((row) => ({
      chain: row.chainId,
      symbol: row.token?.symbol,
      governed: row.dtfs?.length,
    }))
  )
)
