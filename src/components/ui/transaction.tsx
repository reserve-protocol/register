import { chainIdAtom, walletAtom, walletChainAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { useSwitchChain } from 'wagmi'
import { Button } from './button'
import { CHAIN_TAGS } from '@/utils/constants'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Trans } from '@lingui/macro'

type ButtonSize =
  | 'default'
  | 'xs'
  | 'sm'
  | 'lg'
  | 'icon'
  | 'icon-rounded'
  | 'inline'

interface ITransactionButtonContainer {
  children: ReactNode
  chain?: number
  className?: string
  connectButtonClassName?: string
  switchChainButtonClassName?: string
  size?: ButtonSize
}

export const ConnectWalletButton = ({
  className,
  size,
}: {
  className?: string
  size?: ButtonSize
}) => {
  const { openConnectModal } = useConnectModal()

  return (
    <Button
      variant="accent"
      onClick={openConnectModal}
      className={className}
      size={size}
    >
      <Trans>Connect Wallet</Trans>
    </Button>
  )
}

export const TransactionButtonContainer = ({
  children,
  chain,
  className,
  connectButtonClassName,
  switchChainButtonClassName,
  size = 'default',
  ...props
}: ITransactionButtonContainer) => {
  const wallet = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isInvalidWallet = walletChain !== (chain || chainId)
  const { switchChain } = useSwitchChain()
  let Component = children

  if (!wallet) {
    Component = (
      <ConnectWalletButton className={connectButtonClassName} size={size} />
    )
  } else if (isInvalidWallet && switchChain) {
    Component = (
      <Button
        variant="accent"
        onClick={() => switchChain({ chainId: chain || chainId })}
        className={switchChainButtonClassName}
        size={size}
      >
        Switch to {CHAIN_TAGS[chain || chainId]}
      </Button>
    )
  }

  return (
    <div className={className} {...props}>
      {Component}
    </div>
  )
}
