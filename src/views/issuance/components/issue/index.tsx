import styled from '@emotion/styled'
import { Box } from '@theme-ui/components'
import { Button, Input } from 'components'
import { useState } from 'react'
import IssuanceTransactionModal from '../tx-modal'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
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
        <Button mt={2} onClick={handleIssue}>Issue</Button>
      </InputContainer>
      {modal && (
        <IssuanceTransactionModal amount={amount} onClose={handleClose} />
      )}
    </>
  )
}

export default Issue
