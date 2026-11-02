import { EUSD_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'

export function isTimeunitGovernance(name: string) {
  return name === 'Governor Anastasius'
}

export const isEusdRevenueRouter = (
  token?: { chainId: number; address: string } | null
) =>
  token?.chainId === ChainId.Mainnet &&
  token.address.toLowerCase() === EUSD_ADDRESS[ChainId.Mainnet].toLowerCase()
