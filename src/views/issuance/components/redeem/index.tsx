import styled from '@emotion/styled'
import { Button, Input } from 'components'
import { useState } from 'react'
import { Box } from 'theme-ui'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Redeem = ({ balance }: { balance: number }) => {
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
        <Button mt={2} onClick={() => {}}>
          Redeem
        </Button>
      </InputContainer>
    </>
  )
}

export default Redeem
