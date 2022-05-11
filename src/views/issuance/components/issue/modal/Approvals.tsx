import { BigNumber } from '@ethersproject/bignumber'
import { Button } from 'components'
import useBlockNumber from 'hooks/useBlockNumber'
import { useTokenContract } from 'hooks/useContract'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { addTransactionAtom } from 'state/atoms'
import { Box, Divider, Spinner, Text } from 'theme-ui'
import { TransactionState } from 'types'
import { TRANSACTION_STATUS } from 'utils/constants'

interface Props {
  txs: TransactionState[]
  symbol: string
}

const IssuanceApprovals = ({ txs, symbol }: Props) => {
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

  return (
    <Box mt={3}>
      <Divider mx={-3} mb={3} sx={{ borderColor: '#ccc' }} />
      <Button sx={{ width: '100%' }} variant="accent" onClick={handleApprove}>
        Allow {symbol} to use collateral
      </Button>
      <Box mt={2} sx={{ fontSize: 1, textAlign: 'center' }}>
        <Text mr={1}>Estimated gas cost:</Text>
        {gasEstimates.length > 0 ? (
          <Text>TODO</Text>
        ) : (
          <Spinner color="black" size={12} />
        )}
      </Box>
    </Box>
  )
}

export default IssuanceApprovals
