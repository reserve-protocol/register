import { BigNumber } from '@ethersproject/bignumber'
import { Button } from 'components'
import useBlockNumber from 'hooks/useBlockNumber'
import { useTokenContract } from 'hooks/useContract'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { addTransactionAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { TransactionState } from 'types'
import { TRANSACTION_STATUS } from 'utils/constants'

interface Props {
  txs: TransactionState[]
}

const IssuanceApprovals = ({ txs }: Props) => {
  const blockNumber = useBlockNumber()
  const addTransaction = useSetAtom(addTransactionAtom)
  const [gasEstimates, setGasEstimates] = useState([] as BigNumber[])
  const tokenContract = useTokenContract(txs[0]?.call.address, true)!

  const handleApprove = () => {
    addTransaction(txs.filter((tx) => tx.status === TRANSACTION_STATUS.PENDING))
  }

  const fetchGasEstimate = useCallback(async () => {
    try {
      const estimates = await Promise.all(
        txs.map(async (tx) => {
          const contract = tokenContract.attach(tx.call.address)
          return contract.estimateGas.approve(tx.call.args[0], tx.call.args[1])
        })
      )

      setGasEstimates(estimates)
    } catch (e) {
      console.error('error fetching gas estimate', e)
    }
  }, [txs])

  useEffect(() => {
    if (txs.length && blockNumber) {
      fetchGasEstimate()
    }
  }, [blockNumber, JSON.stringify(txs)])

  // Don't show approval modal section
  if (!txs.filter((tx) => tx.status === TRANSACTION_STATUS.PENDING).length) {
    return null
  }

  return (
    <Box>
      <Box mt={3}>
        <Text>Tx to be run</Text>
        <Box mt={3}>
          {txs.map((tx, index) => (
            <Box key={index}>
              <Text>{tx.description}</Text>...
              <Text>Gas cost: $</Text>
            </Box>
          ))}
        </Box>
      </Box>
      <Button onClick={handleApprove}>Approve</Button>
    </Box>
  )
}

export default IssuanceApprovals
