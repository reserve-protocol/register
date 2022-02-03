import styled from '@emotion/styled'
import { parseEther } from '@ethersproject/units'
import { Box } from '@theme-ui/components'
import { StRSRInterface } from 'abis'
import { Button, Input } from 'components'
import { useState } from 'react'
import {
  loadTransactions,
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { ReserveToken } from 'types'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Unstake = ({ data }: { data: ReserveToken }) => {
  const [amount, setAmount] = useState('')
  const [, dispatch] = useTransactionsState()

  const handleUnstake = () => {
    setAmount('')
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
  }

  return (
    <InputContainer mx={2}>
      <Input
        placeholder="Withdrawn amount"
        value={amount}
        onChange={setAmount}
      />
      <Button mt={2} onClick={handleUnstake}>
        Withdraw
      </Button>
    </InputContainer>
  )
}

export default Unstake
