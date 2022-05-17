import { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'
import { Button } from 'components'
import useBlockNumber from 'hooks/useBlockNumber'
import { useTokenContract } from 'hooks/useContract'
import useLastTx from 'hooks/useLastTx'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { addTransactionAtom, ethPriceAtom, gasPriceAtom } from 'state/atoms'
import { Box, Divider, Spinner, Text } from 'theme-ui'
import { TransactionState } from 'types'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'

interface Props {
  txs: TransactionState[]
  symbol: string
}

const IssuanceApprovals = ({ txs, symbol }: Props) => {
  const [signing, setSigning] = useState(false)
  const blockNumber = useBlockNumber()
  const addTransaction = useSetAtom(addTransactionAtom)
  const [gasEstimates, setGasEstimates] = useState([] as BigNumber[])
  const [fee, setFee] = useState(0)
  const tokenContract = useTokenContract(txs[0]?.call.address, true)!
  const gasPrice = useAtomValue(gasPriceAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const runningTx = useLastTx(signing ? txs.length : 0)

  const handleApprove = () => {
    if (signing) return
    addTransaction(txs.filter((tx) => tx.status === TRANSACTION_STATUS.PENDING))
    setSigning(true)
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

  return (
    <Box mt={3}>
      <Divider mx={-3} mb={3} sx={{ borderColor: '#ccc' }} />
      <Button sx={{ width: '100%' }} variant="accent" onClick={handleApprove}>
        {signing ? (
          <Text
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spinner color="black" marginRight={10} size={20} />
            Pending, sign in wallet
          </Text>
        ) : (
          <Text>
            Allow {symbol} to use {txs.length} collaterals
          </Text>
        )}
      </Button>
      <Box mt={2} sx={{ fontSize: 1, textAlign: 'center' }}>
        <Text mr={1}>Estimated gas cost:</Text>
        {gasEstimates.length > 0 ? (
          <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
        ) : (
          <Spinner color="black" size={12} />
        )}
      </Box>
    </Box>
  )
}

export default IssuanceApprovals
