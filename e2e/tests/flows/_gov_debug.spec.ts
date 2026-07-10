import { encodeAbiParameters } from 'viem'
import { test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8'
const dtf = findDtfByAddress(DTF_ADDRESS)!

interface ChainState {
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
  decimals: number
}

test('debug gov gate seeded', async ({ page, overrides }) => {
  const cs = loadSnapshot<ChainState>(`${dtf.snapshotDir}/chain-state.json`)
  overrides.ethCall(
    DTF_ADDRESS,
    '0x01e1d114',
    encodeAbiParameters(
      [{ type: 'address[]' }, { type: 'uint256[]' }],
      [cs.totalAssets.tokens as `0x${string}`[], cs.totalAssets.amounts.map(BigInt)]
    )
  )
  overrides.ethCall(
    DTF_ADDRESS,
    '0x18160ddd',
    encodeAbiParameters([{ type: 'uint256' }], [BigInt(cs.totalSupply)])
  )
  overrides.ethCall(
    DTF_ADDRESS,
    '0x313ce567',
    encodeAbiParameters([{ type: 'uint8' }], [cs.decimals])
  )

  const gov = loadSnapshot<any>(`${dtf.snapshotDir}/governance.json`)
  const dtfData = loadSnapshot<any>(`${dtf.snapshotDir}/dtf.json`).dtf
  const voteToken = dtfData.stToken.id
  const tl = new Map<string, string>()
  for (const g of [dtfData.ownerGovernance, dtfData.tradingGovernance, dtfData.stToken.governance])
    if (g?.id) tl.set(g.id.toLowerCase(), g.timelock?.id)
  overrides.subgraph('GetIndexDtfProposals', {
    stakingToken: gov.stakingToken,
    governances: gov.governances.map((g: any) => ({
      ...g,
      proposals: g.proposals.map((p: any) => ({
        ...p,
        governance: { id: g.id, token: { id: voteToken }, timelock: { id: tl.get(g.id.toLowerCase()) ?? g.id } },
      })),
    })),
  })

  const logs = new Set<string>()
  const ops: string[] = []
  page.on('console', (m) => { if (m.text().includes('[DBG-GOV]')) logs.add(m.text()) })
  page.on('request', (r) => {
    if (r.url().includes('goldsky') && r.method() === 'POST') {
      try { ops.push(JSON.parse(r.postData() ?? '{}').operationName) } catch {}
    }
  })
  await page.goto(dtfPath(dtf, 'governance'))
  await page.waitForTimeout(10000)
  console.log('=== GATE ===')
  console.log([...logs].join('\n'))
  console.log('=== OPS ===', JSON.stringify([...new Set(ops)]))
  console.log('=== ROWS ===', await page.getByTestId('governance-proposals').locator('a[href*="proposal"]').count())
  console.log('=== UNMOCKED sample below (stderr) ===')
})
