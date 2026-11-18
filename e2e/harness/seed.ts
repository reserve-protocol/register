import { encodeAbiParameters, encodeFunctionData, parseAbi, type Address, type Hex } from 'viem'
import type { MockOverrides } from '../helpers/overrides'
import { YIELD_REVERT_SENTINEL } from '../helpers/rpc'
import { TEST_ADDRESS, type RegistryDTF } from '../helpers/registry'
import { loadSnapshot } from '../helpers/snapshots'

// Base INDEX_DEPLOYER — useIsUSDT probes approve(deployer, 1) per basket token.
const INDEX_DEPLOYER = '0x3451fD177E9a8bB4Eb8271E627A804BD22A816F9'
const DAO_FEE_REGISTRY = '0x9980cb23' // daoFeeRegistry() selector
const FEE_REGISTRY_ADDR = '0x1234567890123456789012345678901234567890'
const FEE_DETAILS_ABI = parseAbi([
  'function getFeeDetails(address rToken) view returns (address recipient, uint256 feeNumerator, uint256 feeDenominator, uint256 feeFloor)',
])

// Seed the DAO fee registry: daoFeeRegistry() → a registry address, then
// getFeeDetails(dtf) → [recipient, numerator, denominator, floor]. The platform
// fee % = numerator*100/denominator. num==den ⇒ 100% (exercises the
// PERCENT_ADJUST div-by-zero, ledger M9); a revert path ⇒ fabricated fallback (M10).
export function seedFeeRegistry(
  overrides: MockOverrides,
  dtf: RegistryDTF,
  numerator: bigint,
  denominator: bigint
): void {
  overrides.ethCall(
    dtf.address as Address,
    DAO_FEE_REGISTRY,
    encodeAbiParameters([{ type: 'address' }], [FEE_REGISTRY_ADDR])
  )
  overrides.ethCall(
    FEE_REGISTRY_ADDR,
    encodeFunctionData({ abi: FEE_DETAILS_ABI, functionName: 'getFeeDetails', args: [dtf.address as Address] }),
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }],
      [FEE_REGISTRY_ADDR, numerator, denominator, 0n]
    )
  )
}
const FOLIO_V6_READ_ABI = parseAbi([
  'function version() view returns (string)',
  'function folioFeeForSelf() view returns (uint256)',
  'function immutableFeeRecipients(uint256) view returns (address recipient, uint96 portion)',
  'function tradeAllowlistEnabled() view returns (bool)',
  'function getTokenAllowlist() view returns (address[])',
])
// The SDK probes the whole immutable table in one multicall (Folio 6.0 MAX_FEE_RECIPIENTS).
const MAX_FEE_RECIPIENTS = 64

// Report the folio as 6.0.0 and answer the v6-only settings reads. The array getter
// reverts past the end of the immutable table: the sentinel fails it inside the SDK's
// multicall, and the standalone revert answers the SDK's end-of-table confirmation.
export function seedFolioV6(
  overrides: MockOverrides,
  dtf: RegistryDTF,
  {
    selfFee = 0n,
    immutableRecipients = [],
    allowlist = { enabled: false, tokens: [] },
  }: {
    selfFee?: bigint
    immutableRecipients?: { recipient: Address; portion: bigint }[]
    allowlist?: { enabled: boolean; tokens: Address[] }
  } = {}
): void {
  const folio = dtf.address as Address
  const call = (functionName: string, args: readonly unknown[] = []) =>
    encodeFunctionData({ abi: FOLIO_V6_READ_ABI, functionName, args } as never)
  overrides.ethCall(folio, call('version'), encodeAbiParameters([{ type: 'string' }], ['6.0.0']))
  overrides.ethCall(folio, call('folioFeeForSelf'), encUint(selfFee))
  overrides.ethCall(folio, call('tradeAllowlistEnabled'), encBool(allowlist.enabled))
  overrides.ethCall(
    folio,
    call('getTokenAllowlist'),
    encodeAbiParameters([{ type: 'address[]' }], [allowlist.tokens])
  )
  for (let index = 0; index < MAX_FEE_RECIPIENTS; index++) {
    const entry = immutableRecipients[index]
    const data = call('immutableFeeRecipients', [BigInt(index)])
    if (!entry) overrides.ethCallRevert(folio, data, '')
    overrides.ethCall(
      folio,
      data,
      entry
        ? encodeAbiParameters(
            [{ type: 'address' }, { type: 'uint96' }],
            [entry.recipient, entry.portion]
          )
        : (YIELD_REVERT_SENTINEL as Hex)
    )
  }
}

const SYMBOL = '0x95d89b41' // symbol() — read on the folio once a wallet connects
const READ_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function toAssets(uint256 shares, uint8 rounding) view returns (address[], uint256[])',
])
const encUint = (v: bigint): Hex => encodeAbiParameters([{ type: 'uint256' }], [v])
const encBool = (v: boolean): Hex => encodeAbiParameters([{ type: 'bool' }], [v])
const encString = (v: string): Hex => encodeAbiParameters([{ type: 'string' }], [v])
const MAX_UINT = 2n ** 256n - 1n

interface ChainState {
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
}

export interface SeedManualOpts {
  // DTF shares to fund the wallet for (default 100 — plenty for a render/mint).
  readonly shares?: bigint
  // Allowance per basket token (default MAX → no approval step needed).
  readonly allowance?: bigint
}

// Seed every read the MANUAL issuance page fires with a connected wallet:
// the folio's toAssets(1e18,0) per-share quote + symbol, and per basket token
// balanceOf / allowance / the useIsUSDT approve(deployer,1) simulate probe.
// Generalized across DTFs from each one's captured chain-state + dtf snapshots.
export function seedManualIssuance(
  overrides: MockOverrides,
  dtf: RegistryDTF,
  opts: SeedManualOpts = {}
): void {
  const state = loadSnapshot<ChainState>(`${dtf.snapshotDir}/chain-state.json`)
  const supply = BigInt(state.totalSupply)
  const rates = state.totalAssets.tokens.map((address, i) => ({
    address: address as Address,
    rate: (BigInt(state.totalAssets.amounts[i]) * 10n ** 18n) / supply,
  }))
  const symbol = loadSnapshot<{ dtf: { token: { symbol: string } } }>(
    `${dtf.snapshotDir}/dtf.json`
  ).dtf.token.symbol
  const shares = opts.shares ?? 100n
  const allowance = opts.allowance ?? MAX_UINT
  const folio = dtf.address as Address

  overrides.ethCall(
    folio,
    encodeFunctionData({ abi: READ_ABI, functionName: 'toAssets', args: [10n ** 18n, 0] }),
    encodeAbiParameters(
      [{ type: 'address[]' }, { type: 'uint256[]' }],
      [rates.map((r) => r.address), rates.map((r) => r.rate)]
    )
  )
  overrides.ethCall(folio, SYMBOL, encString(symbol))

  for (const { address, rate } of rates) {
    overrides.ethCall(
      address,
      encodeFunctionData({ abi: READ_ABI, functionName: 'balanceOf', args: [TEST_ADDRESS as Address] }),
      encUint(rate * shares)
    )
    overrides.ethCall(
      address,
      encodeFunctionData({
        abi: READ_ABI,
        functionName: 'allowance',
        args: [TEST_ADDRESS as Address, folio],
      }),
      encUint(allowance)
    )
    overrides.ethCall(
      address,
      encodeFunctionData({ abi: READ_ABI, functionName: 'approve', args: [INDEX_DEPLOYER, 1n] }),
      encBool(true)
    )
  }
}
