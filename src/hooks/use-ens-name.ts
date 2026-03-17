import { shortenAddress } from '@/utils'
import { useEnsName as useWagmiEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

export const useEnsName = (address: string | undefined) => {
  const { data: ensName } = useWagmiEnsName({
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id,
  })

  if (!address) return ''
  return ensName || shortenAddress(address)
}
