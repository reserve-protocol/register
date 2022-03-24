import styled from '@emotion/styled'
import { parseEther } from '@ethersproject/units'
import { Box, Card, Text } from '@theme-ui/components'
import { ERC20Interface, StRSRInterface } from 'abis'
import { Button, NumericalInput } from 'components'
import { RSR } from 'constants/tokens'
import { useState } from 'react'
import {
  loadTransactions,
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { useAppSelector } from 'state/hooks'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Stake = ({ data, ...props }: { data: ReserveToken }) => {
  const [amount, setAmount] = useState('')
  const balance =
    useAppSelector(
      ({ reserveTokens }) => reserveTokens.balances[RSR.address]
    ) || 0
  const [, dispatch] = useTransactionsState()
  const stTokenAddress = data.insurance?.token?.address ?? ''

  const handleStake = () => {
    try {
      loadTransactions(dispatch, [
        {
          autoCall: false,
          description: `Approve ${amount} RSR`,
          status: TX_STATUS.PENDING,
          value: amount,
          call: {
            abi: ERC20Interface,
            address: RSR.address,
            method: 'approve',
            args: [stTokenAddress, parseEther(amount)],
          },
        },
        {
          autoCall: false,
          description: `Stake ${amount} RSR`,
          status: TX_STATUS.PENDING,
          value: amount,
          extra: [[RSR.address, parseEther(amount)]],
          call: {
            abi: StRSRInterface,
            address: stTokenAddress,
            method: 'stake',
            args: [parseEther(amount)],
          },
        },
      ])
    } catch (e) {
      // TODO: UI handle error
      console.error('failed stake', e)
    }
    setAmount('')
  }

  const isValid = () => {
    const value = Number(amount)
    return value > 0 && value <= balance
  }

  return (
    <Card {...props}>
      <InputContainer mx={2}>
        <Text as="label" variant="contentTitle" mb={2}>
          Stake
        </Text>
        <NumericalInput
          id="stake"
          placeholder="Stake amount"
          value={amount}
          onChange={setAmount}
        />
        <Text
          onClick={() => setAmount(balance.toString())}
          as="a"
          variant="a"
          sx={{ marginLeft: 'auto', marginTop: 1 }}
        >
          Max: {formatCurrency(balance)}
        </Text>
        <Button disabled={!isValid()} mt={2} onClick={handleStake}>
          Stake
        </Button>
      </InputContainer>
    </Card>
  )
}

export default Stake
