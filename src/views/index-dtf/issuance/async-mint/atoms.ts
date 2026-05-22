import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { ChainId } from '@/utils/chains'
import { atom } from 'jotai'
import { Address } from 'viem'
import { safeParseEther } from '@/utils'
import { calculateCollateralAllocation } from './utils'
import { CollateralAllocation, MintStrategy, WizardStep } from './types'

// ─── Constants ───────────────────────────────────────────────────────
export const ASYNC_MINT_BUFFER = 0.02

// Input token per chain: USDC for Mainnet/Base, USDT for BSC
export const MINT_INPUT_TOKENS: Record<number, Token> = {
  [ChainId.Mainnet]: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
  },
  [ChainId.Base]: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
  },
  [ChainId.BSC]: {
    address: '0x55d398326f99059fF775485246999027B3197955' as Address,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
  },
}

// ─── Core wizard state ───────────────────────────────────────────────
export const wizardStepAtom = atom<WizardStep>('gnosis-check')
export const mintStrategyAtom = atom<MintStrategy>('single')
export const selectedCollateralsAtom = atom<Set<Address>>(new Set<Address>())
export const customCollateralAmountsAtom = atom<Record<Address, string>>({})
export const collateralSelectionInitializedAtom = atom<boolean>(false)
export const useWalletCollateralAtom = atom<boolean>(false)
export const mintAmountAtom = atom<string>('')
export const slippageAtom = atom<string>('100') // basis points

// ─── Input token ─────────────────────────────────────────────────────
export const inputTokenAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return MINT_INPUT_TOKENS[chainId] ?? MINT_INPUT_TOKENS[ChainId.Base]
})

// ─── Async data atoms (populated by useAllocationData hook) ──────────
// NOTE: Only valid when useAllocationData() is mounted. Used by the collateral
// selection / preview UI (configure-mint, review-inputs); the actual quoting is
// handled by the async-zap SDK.
export const walletBalancesAtom = atom<Record<Address, bigint>>({})
export const tokenPricesAtom = atom<Record<Address, number>>({})
export const folioDetailsAtom = atom<{
  shares: bigint
  assets: Address[]
  mintValues: bigint[]
} | null>(null)

// ─── Dollar → DTF shares conversion (preview estimate) ───────────────
export const mintSharesAtom = atom<bigint>((get) => {
  const dollarAmount = Number(get(mintAmountAtom))
  const dtfPrice = get(indexDTFPriceAtom) || 0
  if (!dtfPrice || !dollarAmount || !isFinite(dollarAmount) || dollarAmount <= 0)
    return 0n
  const shares = (dollarAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
  return safeParseEther(shares.toFixed(18))
})

// ─── Collateral allocation (derived — preview for granular selection UI) ─
export const collateralAllocationAtom = atom<
  Record<Address, CollateralAllocation>
>((get) => {
  const folioDetails = get(folioDetailsAtom)
  const mintShares = get(mintSharesAtom)
  if (!folioDetails || mintShares === 0n) return {}

  const basket = get(indexDTFBasketAtom)
  const decimalsMap: Record<Address, number> = {}
  if (basket) {
    for (const token of basket) {
      decimalsMap[token.address.toLowerCase() as Address] = token.decimals
    }
  }

  const mintValues =
    folioDetails.shares === mintShares
      ? folioDetails.mintValues
      : folioDetails.mintValues.map(
          (value) => (value * mintShares) / folioDetails.shares
        )
  const customCollateralAmounts: Record<Address, bigint> = {}
  const customInputs = get(customCollateralAmountsAtom)
  for (const [address, value] of Object.entries(customInputs)) {
    const normalized = address.toLowerCase() as Address
    if (!value) continue
    customCollateralAmounts[normalized] = safeParseEther(
      value,
      decimalsMap[normalized] ?? 18
    )
  }

  return calculateCollateralAllocation({
    mintShares,
    assets: folioDetails.assets,
    mintValues,
    balances: get(walletBalancesAtom),
    prices: get(tokenPricesAtom),
    decimals: decimalsMap,
    selectedCollaterals: get(selectedCollateralsAtom),
    customCollateralAmounts,
    strategy: get(mintStrategyAtom),
    inputToken: get(inputTokenAtom),
  })
})

// ─── Reset action atom ───────────────────────────────────────────────
// NOTE: collateralAllocationAtom is derived — resets automatically when deps reset
export const resetWizardAtom = atom(null, (_, set) => {
  set(wizardStepAtom, 'gnosis-check')
  set(mintStrategyAtom, 'single')
  set(selectedCollateralsAtom, new Set())
  set(customCollateralAmountsAtom, {})
  set(collateralSelectionInitializedAtom, false)
  set(useWalletCollateralAtom, false)
  set(mintAmountAtom, '')
  set(walletBalancesAtom, {})
  set(tokenPricesAtom, {})
  set(folioDetailsAtom, null)
})
