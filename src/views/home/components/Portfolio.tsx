import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { Box, Text, Grid, BoxProps, Divider } from 'theme-ui'

const Portfolio = (props: BoxProps) => {
  const { account } = useWeb3React()

  if (!account) {
    return null
  }

  return (
    <Box {...props}>
      <Text>
        <Trans>Total Staked RSR + Rtoken Value</Trans>
      </Text>
      <Text
        mt={0}
        pt={0}
        sx={{ fontSize: 6, fontWeight: 400, color: 'boldText' }}
        as="h1"
      >
        $211,052.17
      </Text>
      <Grid columns={[1, 1, 2]} mt={5} gap={5}>
        <Box>
          <Text variant="sectionTitle">
            <Trans>Your RTokens</Trans>
          </Text>
        </Box>
        <Box>
          <Text variant="sectionTitle">
            <Trans>Your staked RSR positions</Trans>
          </Text>
        </Box>
      </Grid>
      <Divider my={5} mx={-5} />
    </Box>
  )
}

export default Portfolio
