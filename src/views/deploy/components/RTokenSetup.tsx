import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { Box, BoxProps, Card, Image } from 'theme-ui'
import TokenParameters from './TokenParameters'
import TransactionDivider from './TransactionDivider'

const RTokenSetup = (props: BoxProps) => {
  return (
    <Box {...props}>
      <BasketSetup />
      <SectionWrapper navigationIndex={3}>
        <RevenueSplit mt={4} />
      </SectionWrapper>
      <TokenParameters mt={4} />
      <TransactionDivider />
    </Box>
  )
}

export default RTokenSetup
