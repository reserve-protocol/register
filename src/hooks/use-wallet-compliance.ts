import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { walletAtom } from '@/state/atoms'
import { type Address } from 'viem'

const STAGING_RESERVE_API = 'https://api-staging.reserve.org/'

export type WalletCompliance = {
  address: Address
  isRestricted: boolean
  shouldSkipRestrictions: boolean
}

const useWalletCompliance = () => {
  const wallet = useAtomValue(walletAtom)

  return useQuery({
    queryKey: ['wallet-compliance', wallet?.toLowerCase()],
    queryFn: async (): Promise<WalletCompliance> => {
      if (!wallet) {
        throw new Error('Missing wallet address')
      }

      const response = await fetch(
        `${STAGING_RESERVE_API}compliance/wallet/${wallet}`
      )

      if (!response.ok) {
        throw new Error('Failed to check wallet compliance')
      }

      return response.json()
    },
    enabled: !!wallet,
  })
}

export default useWalletCompliance
