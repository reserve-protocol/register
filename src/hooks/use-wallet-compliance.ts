import { walletAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { type Address } from 'viem'

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
        `${RESERVE_API}v2/compliance/wallet/${wallet}`
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
