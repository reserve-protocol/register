import { encodeAbiParameters, encodeFunctionData, parseAbi, type Address, type Hex } from 'viem'
import type { MockOverrides } from '../helpers/overrides'
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
