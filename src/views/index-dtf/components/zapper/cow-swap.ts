import { NATIVE_TOKEN } from '@/utils/zapper'
import { Address } from 'viem'

// CoW's URL scheme has no address form for the gas token — it expects the
// native symbol (e.g. swap.cow.fi/#/1/swap/ETH/COW).
const COW_NATIVE_SYMBOL: Record<number, string> = {
  1: 'ETH',
  8453: 'ETH',
  56: 'BNB',
}

const toCowToken = (chainId: number, address: Address): string =>
  address.toLowerCase() === NATIVE_TOKEN.toLowerCase()
    ? (COW_NATIVE_SYMBOL[chainId] ?? address)
    : address

// Trade link into the CoW Swap web app; the buy segment is optional so callers
// without a resolved counter-token can let CoW pick its default.
export const getCowSwapUrl = ({
  chainId,
  sellToken,
  buyToken,
}: {
  chainId: number
  sellToken: Address
  buyToken?: Address
}): string => {
  const sell = toCowToken(chainId, sellToken)
  const buy = buyToken ? `/${toCowToken(chainId, buyToken)}` : ''

  return `https://swap.cow.fi/#/${chainId}/swap/${sell}${buy}`
}
