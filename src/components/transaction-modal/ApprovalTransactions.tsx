import { LoadingButton } from 'components/button'
import TextPlaceholder from 'components/placeholder/TextPlaceholder'
import useTransactionCost from 'hooks/useTransactionCost'
import { useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { addTransactionAtom } from 'state/atoms'
import { useTransactions } from 'state/web3/hooks/useTransactions'
import { Box, Spinner, Text } from 'theme-ui'
import { TransactionState } from 'types'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import TransactionError from './TransactionError'

const ApprovalTransactions = ({
  txs,
  title,
  onConfirm,
  onError,
}: {
  txs: TransactionState[]
  title: string
  onConfirm(): void
  onError(): void
}) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const [signing, setSigning] = useState('')
  const fee = useTransactionCost(txs)
  const txState = useTransactions(signing.split(','))
  const [signed, failedTx] = useMemo(() => {
    const fail = txState.find((tx) => tx.status === TRANSACTION_STATUS.REJECTED)
    const allSigned =
      !!txState.length &&
      txState.every(
        (tx) =>
          tx.status === TRANSACTION_STATUS.MINING ||
          tx.status === TRANSACTION_STATUS.CONFIRMED
      )

    return [allSigned, fail]
  }, [txState])

  const handleApprove = () => {
    setSigning(txs.map((tx) => tx.id).join(','))
    addTransaction(txs)
    onConfirm()
  }

  const handleRetry = () => {
    onError()
    setSigning('')
  }

  if (signed) {
    return (
      <TextPlaceholder
        mt={3}
        text="Transactions signed! Waiting for allowance..."
      />
    )
  }

  return (
    <>
      {!!failedTx && (
        <TransactionError
          title="Transaction failed"
          subtitle={failedTx.description}
          onClose={handleRetry}
        />
      )}
      <Box mt={3}>
        <LoadingButton
          loading={!!signing}
          text={title}
          onClick={handleApprove}
          sx={{ width: '100%' }}
        />
        <Box mt={2} sx={{ fontSize: 1, textAlign: 'center' }}>
          <Text mr={1}>Estimated gas cost:</Text>
          {fee ? (
            <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
          ) : (
            <Spinner color="black" size={12} />
          )}
        </Box>
      </Box>
    </>
  )
}

export default ApprovalTransactions
