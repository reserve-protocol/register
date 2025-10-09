import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { useAccount, useCapabilities } from 'wagmi'

const useAtomicBatch = () => {
  const chainId = useAtomValue(chainIdAtom)
  const { data } = useCapabilities()
  const { connector, chainId: connectedChainId } = useAccount()

  const atomicBatchSupported =
    data?.[connectedChainId || chainId]?.atomicBatch?.supported
  const atomicSupported = ['ready', 'supported'].includes(
    data?.[connectedChainId || chainId]?.atomic?.status ?? ''
  )
  const isMetamask =
    connector?.id.toLowerCase().includes('metamask') ||
    connector?.name.toLowerCase().includes('metamask')

  return {
    atomicSupported: (atomicBatchSupported || atomicSupported) && !isMetamask,
  }
}

export default useAtomicBatch
