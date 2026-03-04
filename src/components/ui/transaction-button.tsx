/**
 * TransactionButton - Blockchain transaction button with wallet/chain validation
 * Uses shadcn Button with transaction-specific functionality
 */
import { t, Trans } from '@lingui/macro'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import TransactionError from 'components/transaction-error/TransactionError'
import useContractWrite from 'hooks/useContractWrite'
import { useGasAmount } from 'hooks/useGasEstimate'
import useNotification from 'hooks/useNotification'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { CheckCircle, Loader2 } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { chainIdAtom, walletAtom, walletChainAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { CHAIN_TAGS } from 'utils/constants'
import { UseSimulateContractParameters, useSwitchChain } from 'wagmi'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils'

export interface TransactionButtonProps extends ButtonProps {
  text?: string
  gas?: bigint
  mining?: boolean
  loading?: boolean
  loadingText?: string
  error?: Error | null
  chain?: number
  errorWithName?: boolean
}

export const GasEstimateLabel = ({ gas }: { gas: bigint }) => {
  const { usd } = useGasAmount(gas)

  return (
    <div className="mt-4 text-sm text-center">
      <span className="text-muted-foreground mr-1">
        <Trans>Estimated gas cost:</Trans>
      </span>
      <span className="font-medium">${formatCurrency(usd)}</span>
    </div>
  )
}

export const ConnectWalletButton = ({ className, ...props }: ButtonProps) => {
  const { openConnectModal } = useConnectModal()

  return (
    <Button
      {...props}
      onClick={openConnectModal}
      variant="accent"
      className={cn('rounded-xl', className)}
    >
      <span>
        <Trans>Connect Wallet</Trans>
      </span>
    </Button>
  )
}

interface ITransactionButtonContainer {
  children?: ReactNode
  chain?: number
  className?: string
}

export const TransactionButtonContainer = ({
  children,
  chain,
  className,
}: ITransactionButtonContainer) => {
  const wallet = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isInvalidWallet = walletChain !== (chain || chainId)
  const { switchChain } = useSwitchChain()
  let Component = children

  if (!wallet) {
    Component = <ConnectWalletButton className="w-full" />
  } else if (isInvalidWallet && switchChain) {
    Component = (
      <Button
        variant="accent"
        className="w-full rounded-xl"
        onClick={() => {
          switchChain({ chainId: chain || chainId })
        }}
      >
        <span>Switch to {CHAIN_TAGS[chain || chainId]}</span>
      </Button>
    )
  }

  return <div className={className}>{Component}</div>
}

const TransactionButton = ({
  gas,
  mining,
  error,
  loading,
  chain,
  loadingText,
  errorWithName = true,
  text,
  className,
  disabled,
  ...props
}: TransactionButtonProps) => {
  const address = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { switchChain } = useSwitchChain()
  const isInvalidWallet = chain
    ? walletChain !== chain
    : walletChain !== chainId

  if (!address) {
    return <ConnectWalletButton className={className} {...props} />
  }

  if (isInvalidWallet && switchChain) {
    return (
      <Button
        {...props}
        className={cn('rounded-xl', className)}
        onClick={() => {
          switchChain({ chainId: chain || chainId })
        }}
      >
        <span>Switch to {CHAIN_TAGS[chain || chainId]}</span>
      </Button>
    )
  }

  const isLoading = loading || mining
  const displayText = mining ? t`Tx in process...` : isLoading ? loadingText : text

  return (
    <>
      <Button
        disabled={disabled || isLoading}
        className={className}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {displayText}
      </Button>
      {!!gas && <GasEstimateLabel gas={gas} />}
      {!!error && (
        <TransactionError
          className="text-center mt-4"
          error={error}
          withName={errorWithName}
        />
      )}
    </>
  )
}

// Execute tx and forget type of button
export interface ExecuteButtonProps extends ButtonProps {
  call: UseSimulateContractParameters | undefined
  text?: string
  txLabel?: string
  successLabel?: string
  onSuccess?(): void
  loading?: boolean
  loadingText?: string
}

export const ExecuteButton = ({
  call,
  onSuccess,
  txLabel,
  successLabel,
  disabled,
  loadingText,
  text,
  className,
  loading: externalLoading,
  ...props
}: ExecuteButtonProps) => {
  const { write, hash, isLoading, validationError, reset, isReady } =
    useContractWrite(call)
  const notify = useNotification()
  const { isMining, status } = useWatchTransaction({
    hash,
    label: txLabel || String(text),
  })

  const isLoading_ = isLoading || isMining || externalLoading
  let displayText = text
  let finalLoadingText = loadingText

  if (isMining) {
    finalLoadingText = t`Tx in process...`
  }

  useEffect(() => {
    if (status === 'success') {
      if (onSuccess) {
        onSuccess()
      }

      setTimeout(reset, 3000)
    }
  }, [status])

  useEffect(() => {
    if (validationError) {
      notify('Transaction not valid', validationError.message, 'error')
    }
  }, [validationError])

  if (status === 'success') {
    if (!successLabel) {
      return <CheckCircle color="#75FBC3" size={18} />
    }
    displayText = successLabel
  }

  return (
    <Button
      disabled={status === 'success' || disabled || !isReady}
      onClick={write}
      className={className}
      {...props}
    >
      {isLoading_ && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading_ ? finalLoadingText : displayText}
    </Button>
  )
}

export default TransactionButton
