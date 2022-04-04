import styled from '@emotion/styled'
import { parseEther } from '@ethersproject/units'
import { ERC20Interface, RSVManagerInterface, RTokenInterface } from 'abis'
import { Button, NumericalInput, Card } from 'components'
import { useState } from 'react'
import {
  loadTransactions,
  TX_STATUS,
  TransactionState,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { Box, Text } from '@theme-ui/components'
import { ReserveToken } from 'types'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const buildTransactions = (
  data: ReserveToken,
  amount: string
): TransactionState[] => {
  const parsedAmount = parseEther(amount)

  if (data.isRSV) {
    return [
      {
        autoCall: false,
        description: 'Approve RSV for redemption',
        status: TX_STATUS.PENDING,
        value: amount,
        call: {
          abi: ERC20Interface,
          address: data.token.address,
          method: 'approve',
          args: [data.id, parsedAmount],
        },
      },
      {
        autoCall: false,
        description: `Redeem ${amount} ${data.token.symbol}`,
        status: TX_STATUS.PENDING,
        value: amount,
        extra: [[data.token.address, parsedAmount]],
        call: {
          abi: RSVManagerInterface,
          address: data.id,
          method: 'redeem',
          args: [parsedAmount],
        },
      },
    ]
  }

  return [
    {
      autoCall: true,
      description: `Redeem ${amount} ${data.token.symbol}`,
      status: TX_STATUS.PENDING,
      value: amount,
      call: {
        abi: RTokenInterface,
        address: data.token.address,
        method: 'redeem',
        args: [parsedAmount],
      },
    },
  ]
}

const Redeem = ({
  max,
  data,
  ...props
}: {
  max: number
  data: ReserveToken
}) => {
  const [amount, setAmount] = useState('')
  const [, dispatch] = useTransactionsState()

  const handleRedeem = () => {
    setAmount('')
    loadTransactions(dispatch, buildTransactions(data, amount))
  }

  const handleMax = () => {
    setAmount(max.toString())
  }

  const isValid = () => {
    const value = Number(amount)
    return value > 0 && value <= max
  }

  return (
    <Card {...props}>
      <InputContainer m={3}>
        <Text variant="contentTitle" mb={2}>
          Redeem
        </Text>
        <NumericalInput
          placeholder="Redeem amount"
          value={amount}
          onChange={setAmount}
        />
        <Text
          onClick={handleMax}
          variant="a"
          sx={{ marginLeft: 'auto', marginTop: 1 }}
        >
          Max: {max}
        </Text>
        <Button disabled={!isValid()} mt={2} onClick={handleRedeem}>
          - Redeem {data.token.symbol}
        </Button>
      </InputContainer>
    </Card>
  )
}

export default Redeem
