import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { Box } from 'theme-ui'
import BackingManager from 'views/deploy/components/BackingManager'
import OtherSetup from 'views/deploy/components/OtherSetup'
import Intro from './Intro'
import ProposalBasketSetup from './ProposalBasketSetup'
import RolesProposal from './RolesProposal'

const sections = [
  Intro,
  BackingManager,
  OtherSetup,
  RolesProposal,
  RevenueSplit,
]

const ProposalForm = () => (
  <Box mb={4}>
    {sections.map((Component, index) => (
      <SectionWrapper
        key={index}
        threshold={index === 3 ? 0.3 : 0.5}
        navigationIndex={index}
        mb={4}
      >
        <Component />
      </SectionWrapper>
    ))}
    <ProposalBasketSetup startIndex={sections.length} />
  </Box>
)

export default ProposalForm
