import styled from '@emotion/styled'
import { parseEther } from '@ethersproject/units'
import { Box } from '@theme-ui/components'
import { ERC20Interface, StRSRInterface } from 'abis'
import { Button, Input } from 'components'
import { RSR } from 'constants/tokens'
import { useState } from 'react'
import {
  loadTransactions,
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { ReserveToken } from 'types'

const TRANSACTION_TYPES = {
  APPROVE: 'approve',
  STAKE: 'stake',
}

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Stake = ({ data }: { data: ReserveToken }) => {
  // const rsrBalance =
  const [amount, setAmount] = useState('')
  const [, dispatch] = useTransactionsState()
  const stTokenAddress = data.insurance?.token?.address ?? ''

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
          address: RSR.address,
          method: TRANSACTION_TYPES.APPROVE,
          args: [stTokenAddress, parseEther(amount)],
        },
      },
      {
        autoCall: false,
        description: `Stake ${amount} RSR`,
        status: TX_STATUS.PENDING,
        value: amount,
        extra: [RSR.address, parseEther(amount)],
        call: {
          abi: StRSRInterface,
          address: stTokenAddress,
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
