import styled from '@emotion/styled'
import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import { Box, BoxProps } from 'theme-ui'
import RTokenParameters from './RTokenParameters'

const Container = styled(Box)`
  overflow: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

const Proposal = (props: BoxProps) => {
  return (
    <Container>
      <BasketSetup />
      <RTokenParameters my={4} />
    </Container>
  )
}

export default Proposal
