import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { useAccount, useCapabilities } from 'wagmi'

const useAtomicBatch = () => {
  const chainId = useAtomValue(chainIdAtom)
  const { data } = useCapabilities()
  const { connector } = useAccount()

  const atomicBatchSupported = data?.[chainId]?.atomicBatch?.supported
  const atomicSupported = ['ready', 'supported'].includes(
    data?.[chainId]?.atomic?.status ?? ''
  )
  const isMetamask =
    connector?.id.toLowerCase().includes('metamask') ||
    connector?.name.toLowerCase().includes('metamask')

  return {
    atomicSupported: (atomicBatchSupported || atomicSupported) && !isMetamask,
  }
}

export default useAtomicBatch
