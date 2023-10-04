import { t } from '@lingui/macro'
import ERC20 from 'abis/ERC20'
import TransactionButton from 'components/button/TransactionButton'
import Modal, { ModalProps } from 'components/modal'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import { Divider } from 'theme-ui'
import { Allowance } from 'types'
import { useContractRead, type UsePrepareContractWriteConfig } from 'wagmi'
import TransactionConfirmedModal from './TransactionConfirmedModal'
import TransactionError from './TransactionError'

export interface ITransactionModal extends Omit<ModalProps, 'onChange'> {
  title: string
  description: string
  children: React.ReactNode
  call?: UsePrepareContractWriteConfig
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
  const { write, isLoading, hash, gas } = useContractWrite({
    address: token,
    abi: ERC20,
    functionName: 'approve',
    args: [spender, (amount * 120n) / 100n],
  })

  const checkingAllowance = !gas.isLoading && !gas.estimateUsd

  return (
    <>
      <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} my={4} />
      <TransactionButton
        loading={isLoading || !!hash}
        loadingText={hash ? 'Waiting for allowance...' : 'Sign in wallet...'}
        onClick={write}
        disabled={!write || checkingAllowance}
        text={
          checkingAllowance
            ? `Verifying allowance...`
            : `Allow use of ${symbol}`
        }
        fullWidth
        gas={gas}
      />
    </>
  )
}

const useHasAllowance = (allowance: Allowance | undefined) => {
  const account = useAtomValue(walletAtom)

  const { data } = useContractRead(
    allowance && account
      ? {
          abi: ERC20,
          functionName: 'allowance',
          address: allowance.token,
          args: [account, allowance.spender],
          watch: true,
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
    status,
    validationError,
    error,
    isReady,
    gas,
    reset,
  } = useContractWrite(hasAllowance && !disabled ? call : undefined)
  useWatchTransaction({ hash, label: description })

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

  const isPreparing =
    hasAllowance &&
    call &&
    !gas.isLoading &&
    !isReady &&
    !validationError &&
    !disabled

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
    </Modal>
  )
}

export default TransactionModal
