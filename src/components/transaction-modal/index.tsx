import { LoadingButton } from 'components/button'
import Modal from 'components/modal'
import useTransactionCost from 'hooks/useTransactionCost'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, ExternalLink } from 'react-feather'
import { addTransactionAtom, allowanceAtom } from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Divider, Flex, Text, Link, Box, Spinner } from 'theme-ui'
import { BigNumberMap, TransactionState } from 'types'
import { formatCurrency, hasAllowance } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { v4 as uuid } from 'uuid'
import ApprovalTransactions from './ApprovalTransactions'
import TransactionError from './TransactionError'
import { t, Trans } from '@lingui/macro'

export interface ITransactionModal {
  title: string
  children: any
  tx: TransactionState
  requiredAllowance: BigNumberMap
  confirmLabel: string
  approvalsLabel?: string
  buildApprovals?: (
    required: BigNumberMap,
    allowances: BigNumberMap
  ) => TransactionState[]
  onClose: () => void
  onChange?(signing: boolean): void
  isValid: boolean
}

const modalStyle = { maxWidth: '420px' }

const TransactionConfirmed = ({
  hash,
  onClose,
}: {
  hash: string
  onClose(): void
}) => (
  <Modal onClose={onClose} style={modalStyle}>
    <Flex
      p={4}
      sx={{
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CheckCircle size={36} />
      <br />
      <Text variant="title">Transaction signed!</Text>
      <br />
      <Link
        href={getExplorerLink(hash, ExplorerDataType.TRANSACTION)}
        target="_blank"
        sx={{ fontSize: 1 }}
      >
        <ExternalLink size={12} /> <Trans>View on etherscan</Trans>
      </Link>
    </Flex>
  </Modal>
)

const TransactionModal = ({
  title,
  requiredAllowance,
  tx,
  children,
  isValid,
  confirmLabel,
  approvalsLabel,
  buildApprovals,
  onClose,
  onChange = () => {},
}: ITransactionModal) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const allowances = useAtomValue(allowanceAtom)
  const [signing, setSigning] = useState('')
  const [requiredApprovals, setApprovalsTx] = useState([] as TransactionState[])
  const canSubmit = useMemo(
    () => isValid && hasAllowance(allowances, requiredAllowance),
    [allowances, isValid, requiredAllowance]
  )

  const txState = useTransaction(signing)
  const signed =
    txState?.status === TRANSACTION_STATUS.MINING ||
    txState?.status === TRANSACTION_STATUS.CONFIRMED
  const [fee, gasError, gasLimit] = useTransactionCost(canSubmit ? [tx] : [])

  const handleConfirm = () => {
    const id = uuid()
    setSigning(id)
    onChange(true)
    if (fee && !gasError) {
      addTransaction([
        {
          ...tx,
          call: {
            ...tx.call,
            args: [
              ...tx.call.args,
              { gasLimit: Math.floor(gasLimit + gasLimit * 0.1) },
            ],
          },
          id,
        },
      ])
    } else {
      addTransaction([{ ...tx, id }])
    }
  }

  const handleRetry = () => {
    setSigning('')
    onChange(false)
  }

  const fetchApprovals = () => {
    if (
      buildApprovals &&
      Object.keys(allowances).length &&
      Object.keys(requiredAllowance).length
    ) {
      setApprovalsTx(buildApprovals(requiredAllowance, allowances))
    } else {
      setApprovalsTx([])
    }
  }

  useEffect(fetchApprovals, [allowances, requiredAllowance])

  if (signed) {
    return <TransactionConfirmed hash={txState.hash ?? ''} onClose={onClose} />
  }

  return (
    <Modal title={title} onClose={onClose} style={modalStyle}>
      {txState?.status === TRANSACTION_STATUS.REJECTED && (
        <TransactionError
          title={t`Transaction failed`}
          subtitle={txState.description}
          onClose={handleRetry}
        />
      )}
      {children}
      {requiredApprovals.length > 0 && !canSubmit && isValid && (
        <>
          <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} my={4} />
          <ApprovalTransactions
            onConfirm={() => onChange(true)}
            onError={() => {
              onChange(false)
              fetchApprovals()
            }}
            title={approvalsLabel ?? 'Approve'}
            txs={requiredApprovals}
          />
        </>
      )}
      <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} mt={4} />
      <LoadingButton
        loading={!!signing}
        disabled={!canSubmit}
        variant={!!signing ? 'accentAction' : 'accentAction'}
        text={confirmLabel}
        onClick={handleConfirm}
        sx={{ width: '100%' }}
        mt={3}
      />
      {!!canSubmit && (
        <Box mt={3} sx={{ fontSize: 1, textAlign: 'center' }}>
          <Text mr={1}>
            <Trans>Estimated gas cost:</Trans>
          </Text>
          {fee ? (
            <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
          ) : (
            <Spinner color="black" size={12} />
          )}
        </Box>
      )}
    </Modal>
  )
}

export default TransactionModal
