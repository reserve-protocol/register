import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { Box } from 'theme-ui'
import BackingManager from 'views/deploy/components/BackingManager'
import OtherSetup from 'views/deploy/components/OtherSetup'

const ProposalForm = () => {
  return (
    <Box mb={4}>
      <BasketSetup startIndex={0} />
      <SectionWrapper navigationIndex={2} mt={4}>
        <RevenueSplit />
      </SectionWrapper>
      <SectionWrapper navigationIndex={3} mt={4}>
        <BackingManager />
      </SectionWrapper>
      <SectionWrapper navigationIndex={4} mt={4}>
        <OtherSetup />
      </SectionWrapper>
    </Box>
  )
}

export default ProposalForm
