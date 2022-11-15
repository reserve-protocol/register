import styled from '@emotion/styled'
import PrimaryBasket from 'components/rtoken-setup/basket/PrimaryBasket'
import { Box, BoxProps, Card } from 'theme-ui'
import SectionWrapper from '../components/SectionWrapper'

const Container = styled(Box)`
  overflow: auto;
`

const Proposal = (props: BoxProps) => {
  return (
    <Container>
      <Card p={5}>
        <SectionWrapper navigationIndex={0}>
          <PrimaryBasket />
        </SectionWrapper>
      </Card>
    </Container>
  )
}

export default Proposal
