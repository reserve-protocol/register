import AsteriskIcon from 'components/icons/AsteriskIcon'
import { Box, Text, Card, Button, Grid, Flex } from 'theme-ui'

const Placeholder = () => {
  return (
    <Grid columns={[1, '1fr 1fr']}>
      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: ' center',
          height: 'calc(100vh - 300px)',
        }}
      >
        <Box sx={{ maxWidth: 400 }}>
          <AsteriskIcon fontSize={32} />
          <Text variant="bold" sx={{ fontSize: 5, lineHeight: '40px' }}>
            There’s no staked RSR positions in this wallet
          </Text>
          <Text variant="legend" as="p" mt="2" mb="3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore.
          </Text>
          <Button>Explore staking options</Button>
        </Box>
      </Flex>
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
        }}
      >
        Placeholder img!
      </Box>
    </Grid>
  )
}

const StakedPortfolio = () => {
  return (
    <Card variant="inner">
      <Placeholder />
    </Card>
  )
}

export default StakedPortfolio
