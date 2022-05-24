import { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'
import { LoadingButton } from 'components/button'
import TextPlaceholder from 'components/placeholder/TextPlaceholder'
import useBlockNumber from 'hooks/useBlockNumber'
import { useTokenContract } from 'hooks/useContract'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { addTransactionAtom, ethPriceAtom, gasPriceAtom } from 'state/atoms'
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
  const [gasEstimates, setGasEstimates] = useState([] as BigNumber[])
  const [fee, setFee] = useState(0)
  const tokenContract = useTokenContract(txs[0]?.call.address, true)!
  const gasPrice = useAtomValue(gasPriceAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const blockNumber = useBlockNumber()
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

  const fetchGasEstimate = useCallback(async () => {
    try {
      let totalFee = 0
      const estimates = await Promise.all(
        txs.map(async (tx) => {
          const contract = tokenContract.attach(tx.call.address)
          const estimate = await contract.estimateGas.approve(
            tx.call.args[0],
            tx.call.args[1]
          )
          totalFee += +formatEther(estimate)
          return estimate
        })
      )

      setGasEstimates(estimates)
      setFee(totalFee * gasPrice * ethPrice)
    } catch (e) {
      console.error('error fetching gas estimate', e)
    }
  }, [txs])

  useEffect(() => {
    if (txs.length && blockNumber) {
      fetchGasEstimate()
    }
  }, [blockNumber, JSON.stringify(txs)])

  const handleRetry = () => {
    onError()
    setSigning('')
  }

  if (signed) {
    return (
      <TextPlaceholder text="Transactions signed! Waiting for allowance..." />
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
          {gasEstimates.length > 0 ? (
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
