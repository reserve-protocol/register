import { walletChainAtom } from '@/state/atoms'
import type { AvailableChain } from '@/utils/chains'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { useSwitchChain } from 'wagmi'

const getIsDocumentActive = () =>
  typeof document !== 'undefined' &&
  document.visibilityState === 'visible' &&
  document.hasFocus()

const useIsDocumentActive = () => {
  const [isActive, setIsActive] = useState(getIsDocumentActive)

  useEffect(() => {
    const update = () => setIsActive(getIsDocumentActive())

    window.addEventListener('focus', update)
    window.addEventListener('blur', update)
    document.addEventListener('visibilitychange', update)

    return () => {
      window.removeEventListener('focus', update)
      window.removeEventListener('blur', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return isActive
}

const useActiveChainSwitch = (
  targetChain: AvailableChain | undefined,
  enabled = true
) => {
  const { switchChain } = useSwitchChain()
  const walletChain = useAtomValue(walletChainAtom)
  const isDocumentActive = useIsDocumentActive()

  useEffect(() => {
    if (
      enabled &&
      isDocumentActive &&
      getIsDocumentActive() &&
      targetChain &&
      walletChain &&
      targetChain !== walletChain
    ) {
      switchChain({ chainId: targetChain })
    }
  }, [enabled, isDocumentActive, targetChain, walletChain, switchChain])
}

export default useActiveChainSwitch
