import styled from '@emotion/styled'
import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { Box } from 'theme-ui'
import TokenParameters from './TokenParameters'

const Container = styled(Box)`
  overflow: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

const RTokenSetup = () => {
  return (
    <Container>
      <BasketSetup />
      <SectionWrapper navigationIndex={2}>
        <RevenueSplit mt={4} />
      </SectionWrapper>
      <TokenParameters my={4} />
    </Container>
  )
}

export default RTokenSetup
