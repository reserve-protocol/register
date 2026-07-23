import { NATIVE_TOKEN } from '@/utils/zapper'
import { Address } from 'viem'

// Trade link into the PancakeSwap web app for a DTF: buying sets the DTF as the
// output currency, selling as the input. The prompt is BSC-only (see
// LargeMintPrompt), so the chain is pinned to bsc on the matching side.
export const getPancakeSwapUrl = ({
  dtfAddress,
  isBuy,
}: {
  dtfAddress: Address
  isBuy: boolean
}): string => {
  const currency = isBuy ? 'outputCurrency' : 'inputCurrency'
  const chain = isBuy ? 'chainOut' : 'chainIn'
  return `https://pancakeswap.finance/swap?${chain}=bsc&${currency}=${dtfAddress}`
}

// PancakeSwap addresses native BNB by symbol, not the EEE sentinel the zapper
// uses.
const toPancakeSwapCurrency = (token: Address): string =>
  token.toLowerCase() === NATIVE_TOKEN.toLowerCase() ? 'BNB' : token

// Fully prefilled trade link for the better-price prompt: the exact pair and
// typed amount the zapper quoted. `exactAmountIn` is the human-readable input
// amount (PancakeSwap parses it as a typed value, not wei).
export const getPancakeSwapTradeUrl = ({
  tokenIn,
  tokenOut,
  exactAmountIn,
}: {
  tokenIn: Address
  tokenOut: Address
  exactAmountIn: string
}): string => {
  const params = new URLSearchParams({
    chain: 'bsc',
    inputCurrency: toPancakeSwapCurrency(tokenIn),
    outputCurrency: toPancakeSwapCurrency(tokenOut),
    exactAmount: exactAmountIn,
    exactField: 'input',
  })
  return `https://pancakeswap.finance/swap?${params.toString()}`
}
