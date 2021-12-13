import styled from '@emotion/styled'
import { parseEther } from '@ethersproject/units'
import { Box } from '@theme-ui/components'
import { ERC20Interface, StRSRInterface } from 'abis'
import { Button, Input } from 'components'
import { useState } from 'react'
import {
  loadTransactions,
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { IReserveToken } from 'state/reserve-tokens/reducer'

const TRANSACTION_TYPES = {
  APPROVE: 'approve',
  STAKE: 'stake',
}

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Stake = ({ data }: { data: IReserveToken }) => {
  // const rsrBalance =
  const [amount, setAmount] = useState('')
  const [, dispatch] = useTransactionsState()

  const handleStake = () => {
    setAmount('')
    loadTransactions(dispatch, [
      {
        autoCall: false,
        description: `Approve ${amount} RSR`,
        status: TX_STATUS.PENDING,
        value: amount,
        call: {
          abi: ERC20Interface,
          address: data.rsr.address,
          method: TRANSACTION_TYPES.APPROVE,
          args: [data.stToken.address, parseEther(amount)],
        },
      },
      {
        autoCall: false,
        description: `Stake ${amount} RSR`,
        status: TX_STATUS.PENDING,
        value: amount,
        extra: [[data.rsr.address, parseEther(amount)]],
        call: {
          abi: StRSRInterface,
          address: data.stToken.address,
          method: TRANSACTION_TYPES.STAKE,
          args: [parseEther(amount)],
        },
      },
    ])
  }

  return (
    <InputContainer mx={2}>
      <Input
        placeholder="stake amount"
        label="Stake amount"
        value={amount}
        onChange={setAmount}
      />
      <Button mt={2} onClick={handleStake}>
        Stake
      </Button>
    </InputContainer>
  )
}

export default Stake
