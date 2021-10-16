import styled from '@emotion/styled'
import { Box } from '@theme-ui/components'
import { Input, Button } from 'components'
import { IRTokenInfo } from 'hooks/useRToken'
import { useState } from 'react'
import IssuanceTransactionModal from '../tx-modal'

const InputContainer = styled(Box)`
  display: flex;
  align-items: flex-end;
  flex-grow: 1;

  div {
    flex-grow: 1;
  }

  button {
    width: 120px;
  }

  input {
    margin-right: 10px;
  }
`

const Issue = () => {
  const [amount, setAmount] = useState('')
  const [modal, setModal] = useState(false)

  const handleIssue = () => {
    setModal(true)
  }

  const handleClose = () => {
    setModal(false)
    setAmount('')
  }

  const handleChange = (value: string) => {
    setAmount(value)
  }

  return (
    <>
      <InputContainer mx={2}>
        <Input
          placeholder="Issue amount"
          label="Issue ammount"
          value={amount}
          onChange={handleChange}
        />
        <Button onClick={handleIssue}>Issue</Button>
      </InputContainer>
      {modal && (
        <IssuanceTransactionModal amount={amount} onClose={handleClose} />
      )}
    </>
  )
}

export default Issue
