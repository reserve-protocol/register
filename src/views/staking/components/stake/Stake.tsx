import styled from '@emotion/styled'
import { parseEther } from '@ethersproject/units'
import { Box, Card, Text } from 'theme-ui'
import { ERC20Interface, StRSRInterface } from 'abis'
import { Button, NumericalInput } from 'components'
import { RSR } from 'constants/tokens'
import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useState } from 'react'
import { addTransactionAtom, allowanceAtom, balancesAtom } from 'state/atoms'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Stake = ({ data, ...props }: { data: ReserveToken }) => {
  const [amount, setAmount] = useState('')
  const allowances = useAtomValue(allowanceAtom)
  const balance = useAtomValue(balancesAtom)[RSR.address] || 0
  const addTransaction = useSetAtom(addTransactionAtom)
  const stTokenAddress = data.insurance?.token?.address ?? ''

  const handleStake = () => {
    try {
      const stakeAmount = parseEther(amount)
      // const hasAllowance = allowances[RSR.address]?.gte(stakeAmount)

      addTransaction([
        {
          description: `Approve ${amount} RSR`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: ERC20Interface,
            address: RSR.address,
            method: 'approve',
            args: [stTokenAddress, stakeAmount],
          },
        },
        {
          description: `Stake ${amount} RSR`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          requiredAllowance: [[RSR.address, stakeAmount]],
          call: {
            abi: StRSRInterface,
            address: stTokenAddress,
            method: 'stake',
            args: [stakeAmount],
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
      <InputContainer m={3}>
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
