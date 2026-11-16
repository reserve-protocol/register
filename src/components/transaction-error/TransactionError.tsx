import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'
import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
} from 'viem'

interface Props {
  error?: Error | null
  withName?: boolean
  className?: string
}

type WalletFailure = 'insufficient-funds' | 'wallet-error'

const EXECUTION_REVERTED_CODE = 3

// viem reports any wallet RPC failure (-32603) as a revert, using the wallet's message as the reason.
export const getWalletFailure = (error: Error): WalletFailure | undefined => {
  if (!(error instanceof BaseError)) return undefined
  if (error.walk((e) => e instanceof InsufficientFundsError)) {
    return 'insufficient-funds'
  }

  const revert = error.walk((e) => e instanceof ContractFunctionRevertedError)
  if (!(revert instanceof ContractFunctionRevertedError)) return undefined
  if (revert.data || (revert.raw && revert.raw !== '0x')) return undefined
  if (!revert.reason || /revert/i.test(revert.reason)) return undefined
  const isExecutionReverted = error.walk(
    (e) => (e as { code?: unknown }).code === EXECUTION_REVERTED_CODE
  )
  if (isExecutionReverted) return undefined

  return 'wallet-error'
}

const TransactionError = ({ error, withName = true, className }: Props) => {
  const { t } = useLingui()
  if (!error) {
    return null
  }
  let parsed = false
  let showName = withName

  const messageSplit = error.message.split('\n')
  let message =
    messageSplit.length > 1
      ? messageSplit[0] + ' ' + messageSplit[1]
      : (messageSplit[0] ?? '')

  const walletFailure = getWalletFailure(error)

  if (message.includes('0x168cdd18')) {
    parsed = true
    message = t`Proposal cannot be executed while another auction is currently running`
  } else if (walletFailure === 'insufficient-funds') {
    parsed = true
    showName = false
    message = t`Your wallet doesn't have enough funds to pay for gas. Add some and try again.`
  } else if (walletFailure === 'wallet-error') {
    parsed = true
    showName = false
    message = t`Your wallet couldn't send this transaction. Make sure you have enough funds to pay for gas and try again.`
  }

  return (
    <div
      className={className}
      data-testid="transaction-error"
      data-error-kind={walletFailure}
    >
      <span
        className={cn(
          'text-sm text-destructive whitespace-break-spaces',
          parsed ? 'break-words' : 'break-all'
        )}
      >
        {showName && `${error.name}:`}
        {showName && <br />}
        {message}
      </span>
    </div>
  )
}

export default TransactionError
