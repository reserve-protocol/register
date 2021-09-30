import styled from '@emotion/styled'
import { Button, Input } from 'components'
import { BigNumberish } from 'ethers'
import { useState } from 'react'
import { Box } from 'theme-ui'

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

const Redeem = ({
  address,
  balance,
}: {
  address: string
  balance: BigNumberish
}) => {
  const [amount, setAmount] = useState('')

  return (
    <>
      <InputContainer mx={2}>
        <Input
          placeholder="Redeem amount"
          label="Redeem amount"
          value={amount}
          onChange={setAmount}
        />
        <Button onClick={() => {}}>Redeem</Button>
      </InputContainer>
    </>
  )
}

export default Redeem
