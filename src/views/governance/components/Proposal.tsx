import styled from '@emotion/styled'
import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import { Box, BoxProps } from 'theme-ui'

const Container = styled(Box)`
  overflow: auto;
`

const Proposal = (props: BoxProps) => {
  return (
    <Container>
      <BasketSetup />
    </Container>
  )
}

export default Proposal
