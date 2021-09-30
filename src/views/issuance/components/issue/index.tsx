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

const Issue = ({ rToken }: { rToken: IRTokenInfo }) => {
  const [amount, setAmount] = useState('1')
  const [modal, setModal] = useState(false)

  return (
    <>
      <InputContainer mx={2}>
        <Input
          placeholder="Issue amount"
          label="Issue ammount"
          value={amount}
          onChange={setAmount}
        />
        <Button onClick={() => setModal(true)}>Issue</Button>
      </InputContainer>
      {modal && (
        <IssuanceTransactionModal
          rToken={rToken}
          amount={amount}
          onClose={() => setModal(false)}
        />
      )}
    </>
  )
}

export default Issue
