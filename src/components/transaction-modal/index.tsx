import { t } from '@lingui/macro'
import ERC20 from 'abis/ERC20'
import TransactionButton from '@/components/old/button/TransactionButton'
import Modal, { ModalProps } from '@/components/old/modal'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { Divider, Text, Box } from 'theme-ui'
import { Allowance } from 'types'
import TransactionConfirmedModal from './TransactionConfirmedModal'
import TransactionError from './TransactionError'
import { useMemo } from 'react'
import { useWatchReadContract } from 'hooks/useWatchReadContract'
import { UseSimulateContractParameters } from 'wagmi'

export interface ITransactionModal extends Omit<ModalProps, 'onChange'> {
  title: string
  description: string
  children: React.ReactNode
  call?: UseSimulateContractParameters
  requiredAllowance?: Allowance
  confirmLabel: string
  onClose: () => void
  onChange?(isLoading: boolean): void
  disabled?: boolean
}

const Approval = ({
  data: { token, spender, symbol, amount },
}: {
  data: Allowance
}) => {
  const { write, isLoading, isReady, hash, gas } = useContractWrite({
    address: token,
    abi: ERC20,
    functionName: 'approve',
    args: [spender, (amount * 120n) / 100n],
  })

  return (
    <>
      <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} my={4} />
      <TransactionButton
        loading={isLoading || !!hash}
        loadingText={hash ? 'Waiting for allowance...' : 'Sign in wallet...'}
        onClick={write}
        disabled={!isReady}
        text={!isReady ? `Verifying allowance...` : `Allow use of ${symbol}`}
        fullWidth
        gas={gas}
      />
    </>
  )
}

const useHasAllowance = (allowance: Allowance | undefined) => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)

  const { data } = useWatchReadContract(
    allowance && account
      ? {
          abi: ERC20,
          functionName: 'allowance',
          address: allowance.token,
          args: [account, allowance.spender],
          chainId,
        }
      : undefined
  )

  if (!allowance) {
    return true
  }

  return (data ?? 0n) >= allowance.amount
}

const TransactionModal = ({
  title,
  requiredAllowance,
  call,
  children,
  disabled,
  description,
  confirmLabel,
  onClose,
  onChange = () => {},
  ...props
}: ITransactionModal) => {
  const hasAllowance = useHasAllowance(requiredAllowance)
  const {
    isLoading,
    write,
    hash,
    isIdle,
    status,
    validationError,
    error,
    isReady,
    gas,
    reset,
  } = useContractWrite(hasAllowance && !disabled ? call : undefined)
  useWatchTransaction({ hash, label: description })

  const validationMessage = useMemo(() => {
    if (validationError) {
      if (validationError.message.indexOf('empty redemption') !== -1) {
        return 'Current basket not capitalized, please try to redeem with a previous basket.'
      }
    }

    return null
  }, [validationError?.message])

  const handleConfirm = () => {
    if (write) {
      onChange(true)
      write()
    }
  }

  const handleRetry = () => {
    reset()
    onChange(false)
  }

  if (hash) {
    return <TransactionConfirmedModal hash={hash} onClose={onClose} />
  }

  const isPreparing = hasAllowance && call && !gas
  !isReady && !validationError && !isIdle && !disabled

  return (
    <Modal title={title} onClose={onClose} {...props}>
      {status === 'error' && (
        <TransactionError
          title={t`Transaction failed`}
          subtitle={error?.message}
          onClose={handleRetry}
        />
      )}
      {children}
      {requiredAllowance && !hasAllowance && (
        <Approval data={requiredAllowance} />
      )}
      <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} mt={4} />
      <TransactionButton
        loading={isLoading || isPreparing}
        disabled={!isReady || disabled}
        loadingText={
          isPreparing ? t`Preparing transaction` : t`Pending, sign in wallet`
        }
        text={confirmLabel}
        onClick={handleConfirm}
        fullWidth
        gas={hasAllowance ? gas : undefined}
        mt={3}
      />
      {!!validationMessage && (
        <Box sx={{ textAlign: 'center', fontSize: 1 }} mt={3}>
          <Text variant="error">{validationMessage}</Text>
        </Box>
      )}
    </Modal>
  )
}

export default TransactionModal
