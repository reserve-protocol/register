import { Trans } from '@lingui/macro'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'

const mockTokens: any = [
  { name: 'USD1', price: '$1.00', balance: '0.00', value: '0.00', apy: '0.00' },
  {
    name: 'USD1',
    price: '$1.00',
    balance: '0.00',
    value: '$1,308.38',
    apy: '3.05',
  },
]

const stakingTokens: any = [
  {
    name: 'USD1RSR',
    rate: '1.024700',
    balance: '10,234,400',
    rsrValue: '10,487,190',
    usdValue: '200,743.79',
    apy: '5.45%',
  },
  {
    name: 'USD1RSR',
    rate: '1.013800',
    balance: '0.00',
    rsrValue: '0',
    usdValue: '$0',
    apy: '5.04%',
  },
]

const Portfolio = (props: BoxProps) => {
  const rTokenColumns = useMemo(
    () => [
      { Header: 'RToken', accessor: 'name' },
      { Header: 'Price', accessor: 'price' },
      { Header: 'Balance', accessor: 'balance' },
      { Header: 'Value', accessor: 'value' },
      { Header: 'APY', accessor: 'apy' },
    ],
    []
  )
  const stTokenColumns = useMemo(
    () => [
      { Header: 'IP Token', accessor: 'name' },
      { Header: 'RSR Rate', accessor: 'rate' },
      { Header: 'Balance', accessor: 'balance' },
      { Header: 'RSR Value', accessor: 'rsrValue' },
      { Header: 'USD Value', accessor: 'usdValue' },
      { Header: 'APY', accessor: 'apy' },
    ],
    []
  )

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
      <Grid columns={[1, 1, 1, 2]} mt={5} gap={5}>
        <Box>
          <Text variant="sectionTitle">
            <Trans>Your RTokens</Trans>
          </Text>
          <Table mt={3} columns={rTokenColumns} data={mockTokens} />
        </Box>
        <Box>
          <Text variant="sectionTitle">
            <Trans>Your staked RSR positions</Trans>
          </Text>
          <Table mt={3} columns={stTokenColumns} data={stakingTokens} />
        </Box>
      </Grid>
      <Divider my={5} mx={-5} />
    </Box>
  )
}

export default Portfolio
