import { Box, BoxProps, Grid, Flex, Text } from 'theme-ui'
import { t } from '@lingui/macro'
import GovernanceActions from './components/GovernanceOverview'
import ProposalList from './components/ProposalList'
import TopVoters from './components/TopVoters'
import ConstructionIcon from 'components/icons/ConstructionIcon'
import Help from 'components/help'

const Governance = (props: BoxProps) => {
  return (
    <Grid
      columns={[1, 1, 1, '2fr 1.5fr']}
      gap={[3, 5]}
      padding={[1, 5]}
      sx={{
        height: '100%',
        position: 'relative',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
      }}
      {...props}
    >
      <Box>
        <ProposalList />
        <TopVoters mt={5} />
      </Box>
      <GovernanceActions />
    </Grid>
  )
}

export default Governance
