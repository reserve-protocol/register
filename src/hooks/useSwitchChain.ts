import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { chainIdAtom } from 'state/atoms'
import { supportedChains } from 'utils/chains'
import { useSwitchNetwork } from 'wagmi'

const useSwitchChain = () => {
  const [chainId, setChainId] = useAtom(chainIdAtom)
  const { switchNetwork } = useSwitchNetwork()

  return useCallback(
    (chain: number) => {
      if (chain !== chainId && supportedChains.has(chain)) {
        // Switch network if supported by wallet
        setChainId(chain)
        if (switchNetwork) {
          switchNetwork(chain)
        }
      }
    },
    [chainId, switchNetwork]
  )
}

export default useSwitchChain
