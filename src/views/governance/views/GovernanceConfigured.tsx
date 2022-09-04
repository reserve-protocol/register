import { Trans } from '@lingui/macro'
import { useLastTransaction } from 'state/web3/hooks/useTransactions'
import { Box, Text, Card, Grid, Flex, Button, Divider } from 'theme-ui'
import ListingInfo from 'views/management/components/ListingInfo'

const GovernanceConfigured = () => {
  const tx = useLastTransaction()

  console.log('tx', tx)

  const handleTally = () => {
    window.open('https://www.tally.xyz/?action=start-a-dao', '_blank')
  }

  return (
    <Box p={5}>
      <Flex ml={3} mb={4} sx={{ alignItems: 'center' }}>
        <Box>
          <Text sx={{ display: 'block', fontSize: 4, fontWeight: 500 }}>
            <Trans>Governance setup completed</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </Box>
        <Button ml="auto" px={3} onClick={handleTally}>
          <Trans>Setup Tally</Trans>
        </Button>
      </Flex>
      <Grid columns={2} gap={5}>
        <Card px={4}>
          <Text variant="title">
            <Trans>Main addresses</Trans>
          </Text>
          <Divider my={3} />
          TODO
        </Card>
        <ListingInfo />
      </Grid>
    </Box>
  )
}

export default GovernanceConfigured
