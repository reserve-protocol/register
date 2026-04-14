import { chainIdAtom, walletAtom, walletChainAtom } from '@/state/atoms'
import { cn } from '@/lib/utils'
import { CHAIN_TAGS } from '@/utils/constants'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAtomValue } from 'jotai'
import { LoaderCircle } from 'lucide-react'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useSwitchChain } from 'wagmi'

type Status = 'idle' | 'switching-chain' | 'connecting'

interface SeamlessTransactionContainerProps {
  children: ReactNode
  chain?: number
  className?: string
}

export const SeamlessTransactionContainer = ({
  children,
  chain,
  className,
}: SeamlessTransactionContainerProps) => {
  const wallet = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const chainId = useAtomValue(chainIdAtom)
  const targetChain = chain || chainId

  const { switchChainAsync } = useSwitchChain()
  const { openConnectModal, connectModalOpen } = useConnectModal()

  const [status, setStatus] = useState<Status>('idle')
  const containerRef = useRef<HTMLDivElement>(null)
  const prevModalOpenRef = useRef(false)
  const skipInterceptRef = useRef(false)

  const needsConnection = !wallet
  const needsChainSwitch = !!wallet && walletChain !== targetChain
  const chainName = CHAIN_TAGS[targetChain] || `Chain ${targetChain}`

  const triggerChildClick = useCallback(() => {
    skipInterceptRef.current = true
    setTimeout(() => {
      requestAnimationFrame(() => {
        const button = containerRef.current?.querySelector('button')
        if (button && !button.disabled) {
          button.click()
        }
        setTimeout(() => {
          skipInterceptRef.current = false
        }, 100)
      })
    }, 150)
  }, [])

  const handleChainSwitch = useCallback(async () => {
    if (!switchChainAsync) {
      toast.error(`Please switch to ${chainName} manually in your wallet`)
      setStatus('idle')
      return
    }

    setStatus('switching-chain')
    try {
      await switchChainAsync({ chainId: targetChain })
      setStatus('idle')
      triggerChildClick()
    } catch {
      setStatus('idle')
      toast.error(`Failed to switch to ${chainName}`)
    }
  }, [switchChainAsync, targetChain, chainName, triggerChildClick])

  // Watch for connect modal close to determine outcome
  useEffect(() => {
    if (
      prevModalOpenRef.current &&
      !connectModalOpen &&
      status === 'connecting'
    ) {
      if (wallet) {
        if (walletChain !== targetChain) {
          handleChainSwitch()
        } else {
          setStatus('idle')
          triggerChildClick()
        }
      } else {
        setStatus('idle')
        toast.error('Failed to connect wallet')
      }
    }

    prevModalOpenRef.current = !!connectModalOpen
  }, [
    connectModalOpen,
    wallet,
    walletChain,
    targetChain,
    status,
    handleChainSwitch,
    triggerChildClick,
  ])

  const handleCapture = (e: React.MouseEvent) => {
    if (skipInterceptRef.current) return

    if (status !== 'idle') {
      e.stopPropagation()
      e.preventDefault()
      return
    }

    if (needsConnection) {
      e.stopPropagation()
      e.preventDefault()
      setStatus('connecting')
      openConnectModal?.()
    } else if (needsChainSwitch) {
      e.stopPropagation()
      e.preventDefault()
      handleChainSwitch()
    }
  }

  const isConnecting = status === 'connecting'

  return (
    <div
      ref={containerRef}
      className={cn(className, isConnecting && 'relative')}
      onClickCapture={handleCapture}
    >
      <div className={cn(isConnecting && 'pointer-events-none opacity-50')}>
        {children}
      </div>
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoaderCircle size={16} className="animate-spin" />
        </div>
      )}
    </div>
  )
}
