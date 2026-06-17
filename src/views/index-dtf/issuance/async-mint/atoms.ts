import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { ChainId } from '@/utils/chains'
import { atom } from 'jotai'
import { Address } from 'viem'
import { WizardStep } from './types'

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

// ─── Wizard state ────────────────────────────────────────────────────
export const wizardStepAtom = atom<WizardStep>('gnosis-check')
export const slippageAtom = atom<string>('100') // basis points

// User-initiated escape hatch out of a slow quote fetch. Gates the SDK quote
// hooks' `enabled` so polling stops, while leaving every input atom intact so
// the user keeps their place. Cleared on retry / edit / reset.
export const quoteCanceledAtom = atom<boolean>(false)

// ─── Operation (mint | redeem) ───────────────────────────────────────
export const operationAtom = atom<'mint' | 'redeem'>('mint')
// Whether to use the user's existing basket-token balances to reduce swaps.
export const useExistingBalancesAtom = atom<boolean>(false)
// Amounts (strings). mint: quoteToken/USD; redeem: DTF shares (18 dec).
export const mintAmountAtom = atom<string>('')
export const redeemAmountAtom = atom<string>('')

// ─── Input token ─────────────────────────────────────────────────────
export const inputTokenAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return MINT_INPUT_TOKENS[chainId] ?? MINT_INPUT_TOKENS[ChainId.Base]
})

// Wallet balances of basket tokens + quote token captured right before
// execution, used to compute leftover dust afterwards (the SDK uses sell
// orders, so swap outputs don't match basket proportions exactly). Keyed by
// lowercase address.
export const dustStartBalancesAtom = atom<Record<string, bigint>>({})

// ─── Reset action atom ───────────────────────────────────────────────
export const resetWizardAtom = atom(null, (_, set) => {
  set(wizardStepAtom, 'gnosis-check')
  set(operationAtom, 'mint')
  set(useExistingBalancesAtom, false)
  set(mintAmountAtom, '')
  set(redeemAmountAtom, '')
  set(dustStartBalancesAtom, {})
  set(quoteCanceledAtom, false)
})
