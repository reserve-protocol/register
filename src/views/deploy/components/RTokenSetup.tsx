import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { Box, BoxProps } from 'theme-ui'
import TokenParameters from './TokenParameters'

const RTokenSetup = (props: BoxProps) => {
  return (
    <Box {...props}>
      <BasketSetup />
      <SectionWrapper navigationIndex={2}>
        <RevenueSplit mt={4} />
      </SectionWrapper>
      <TokenParameters my={4} />
    </Box>
  )
}

export default RTokenSetup
