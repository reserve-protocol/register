import styled from '@emotion/styled'
import { parseEther } from '@ethersproject/units'
import { Box, Card, Text } from '@theme-ui/components'
import { StRSRInterface } from 'abis'
import { Button, NumericalInput } from 'components'
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

const Unstake = ({ data }: { data: ReserveToken }) => {
  const [amount, setAmount] = useState('')
  const balance =
    useAppSelector(
      ({ reserveTokens }) =>
        reserveTokens.balances[data.insurance?.token.address ?? '']
    ) || 0
  const [, dispatch] = useTransactionsState()

  const handleUnstake = () => {
    loadTransactions(dispatch, [
      {
        autoCall: true,
        description: `Withdrawn ${amount}`,
        status: TX_STATUS.PENDING,
        value: amount,
        call: {
          abi: StRSRInterface,
          address: data.insurance?.token?.address as string,
          method: 'unstake',
          args: [parseEther(amount)],
        },
      },
    ])

    setAmount('')
  }

  const isValid = () => {
    const value = Number(amount)
    return value > 0 && value <= balance
  }

  return (
    <Card>
      <InputContainer m={3}>
        <Text as="label" variant="contentTitle" mb={2}>
          UnStake
        </Text>
        <NumericalInput
          id="unstake"
          placeholder="UnStake amount"
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
        <Button mt={2} disabled={!isValid()} onClick={handleUnstake}>
          Unstake
        </Button>
      </InputContainer>
    </Card>
  )
}

export default Unstake
