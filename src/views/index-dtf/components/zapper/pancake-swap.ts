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
