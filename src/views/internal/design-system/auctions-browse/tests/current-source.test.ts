import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import snapshot from '../../auctions-current/snapshot.json'
import discover from '../../table-family/discover-snapshot.json'
import { LIQUIDITY_RECORD } from '../../auctions-current/fixtures'

it.each(['bsc/cmc20', 'base/lcap'] as const)(
  'retains %s captured identities and window without inventing source fields',
  (key) => {
    const source = JSON.parse(
      readFileSync(`e2e/snapshots/${key}/rebalances.json`, 'utf8')
    )
    const row = source.data.rebalances.find(
      (r: { nonce: string }) => r.nonce === String(snapshot[key].identity.nonce)
    )
    const current = snapshot[key]
    expect(current.address).toBe(source._meta.dtf)
    expect(current.chainId).toBe(source._meta.chainId)
    expect(current.transactionHash).toBe(row.transactionHash)
    expect(String(current.identity.restrictedUntil)).toBe(row.restrictedUntil)
    expect(String(current.identity.availableUntil)).toBe(row.availableUntil)
    expect(current.tokens).toEqual(row.tokens)
  }
)

it('identifies the synthetic Ondo addition from a real same-chain Discover basket', () => {
  const origin = discover.rows.find((row) => row.symbol === 'BUILDOUT')!
  const asset = origin.basket.find((token) => token.symbol === 'NVDAon')!
  expect(LIQUIDITY_RECORD.chainId).toBe(origin.chainId)
  expect(LIQUIDITY_RECORD.tokens.at(-1)).toEqual({
    address: asset.address,
    name: asset.name,
    symbol: asset.symbol,
  })
})
