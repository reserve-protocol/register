import styled from '@emotion/styled'
import { parseEther } from '@ethersproject/units'
import { MainInterface } from 'abis'
import { Button, Input } from 'components'
import { useState } from 'react'
import {
  loadTransactions,
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { Box } from 'theme-ui'
import { ReserveToken } from 'types'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Redeem = ({ balance, data }: { balance: number; data: ReserveToken }) => {
  const [amount, setAmount] = useState('')
  const [, dispatch] = useTransactionsState()

  const handleRedeem = () => {
    setAmount('')
    loadTransactions(dispatch, [
      {
        autoCall: true,
        description: `Redeem ${amount} ${data.token.symbol}`,
        status: TX_STATUS.PENDING,
        value: amount,
        call: {
          abi: MainInterface,
          address: data.id,
          method: 'redeem',
          args: [parseEther(amount)],
        },
      },
    ])
  }

  return (
    <InputContainer mx={2}>
      <Input
        placeholder="Redeem amount"
        label="Redeem amount"
        value={amount}
        onChange={setAmount}
      />
      <Button mt={2} onClick={handleRedeem}>
        Redeem
      </Button>
    </InputContainer>
  )
}

export default Redeem
