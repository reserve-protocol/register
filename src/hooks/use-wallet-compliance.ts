import { trackCompliance } from '@/hooks/useTrackPage'
import { walletAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { isAddress, type Address } from 'viem'

export type WalletCompliance = {
  address: Address
  isRestricted: boolean
  shouldSkipRestrictions: boolean
}

const isWalletCompliance = (value: unknown): value is WalletCompliance => {
  if (typeof value !== 'object' || value === null) return false
  const data = value as Record<string, unknown>
  return (
    typeof data.address === 'string' &&
    isAddress(data.address) &&
    typeof data.isRestricted === 'boolean' &&
    typeof data.shouldSkipRestrictions === 'boolean'
  )
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
        trackCompliance({ endpoint: 'wallet', status: 'error' })
        throw new Error('Failed to check wallet compliance')
      }

      const payload: unknown = await response.json()
      if (!isWalletCompliance(payload)) {
        trackCompliance({ endpoint: 'wallet', status: 'error' })
        throw new Error('Invalid wallet compliance payload')
      }

      trackCompliance({
        endpoint: 'wallet',
        status: 'success',
        restricted: payload.isRestricted,
        shouldSkipRestrictions: payload.shouldSkipRestrictions,
      })

      return payload
    },
    enabled: !!wallet,
  })
}

export default useWalletCompliance
