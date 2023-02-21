import { t } from '@lingui/macro'
import Navigation from 'components/section-navigation/Navigation'
import { Box } from 'theme-ui'

const ProposalDetailNavigation = ({ sections }: { sections: string[] }) => (
  <Box variant="layout.sticky">
    <Navigation title={t`Contracts`} mt={5} sections={sections} />
  </Box>
)

export default ProposalDetailNavigation
