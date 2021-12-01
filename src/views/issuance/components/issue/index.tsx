import styled from '@emotion/styled'
import { Box } from '@theme-ui/components'
import { Button, Input } from 'components'
import { useState } from 'react'
import { useTransactionsState } from 'state/context/TransactionManager'
import { IReserveToken } from 'state/reserve-tokens/reducer'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

/**
 * Issuance
 * Handles issuance, creates the set of transactions that will be later handled by the container
 * @required TransactionManager context
 *
 * @returns React.Component
 */
// TODO: Max issuance possible algorithm
// TODO: Validations
const Issue = ({
  data,
  onIssue,
  ...props
}: {
  data: IReserveToken
  onIssue: (amount: number) => void
}) => {
  const [amount, setAmount] = useState('')
  const [, dispatch] = useTransactionsState()

  const handleIssue = () => {
    onIssue(Number(amount))
  }

  const handleChange = (value: string) => {
    setAmount(value)
  }

  return (
    <InputContainer mx={2} {...props}>
      <Input
        placeholder="Mint amount"
        label="Mint ammount"
        value={amount}
        onChange={handleChange}
      />
      <Button mt={2} onClick={handleIssue}>
        Mint
      </Button>
    </InputContainer>
  )
}

export default Issue
