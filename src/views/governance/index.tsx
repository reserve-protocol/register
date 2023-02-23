import { Box, BoxProps, Grid, Flex, Text } from 'theme-ui'
import { t } from '@lingui/macro'
import GovernanceActions from './components/GovernanceOverview'
import ProposalList from './components/ProposalList'
import TopVoters from './components/TopVoters'
import ConstructionIcon from 'components/icons/ConstructionIcon'
import Help from 'components/help'

const Governance = (props: BoxProps) => {
  return (
    <Flex
      sx={{
        border: '1px dashed',
        borderColor: '#FF8A00',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100%',
      }}
    >
      <Box
        py={2}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          borderBottom: '1px dashed',
          borderColor: '#FF8A00',
          width: '100%',
        }}
      >
        <Box
          sx={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }}
        >
          <ConstructionIcon />
          <Box mx={2} py={2}>
            <Text>Page under construction</Text>
          </Box>
          <Help
            content={t`Please be patient with us while we improve governance related views`}
          />
        </Box>
      </Box>
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
    </Flex>
  )
}

export default Governance
