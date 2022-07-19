import { t, Trans } from '@lingui/macro'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { accountPositionsAtom, accountTokensAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'
import {
  formatCurrency,
  formatCurrencyCell,
  formatUsdCurrencyCell,
} from 'utils'

const Portfolio = (props: BoxProps) => {
  const rTokens = useAtomValue(accountTokensAtom)
  const stTokens = useAtomValue(accountPositionsAtom)
  // TODO: Update changing lang
  const rTokenColumns = useMemo(
    () => [
      { Header: 'RToken', accessor: 'symbol' },
      { Header: t`Price`, accessor: 'usdPrice', Cell: formatUsdCurrencyCell },
      { Header: t`Balance`, accessor: 'balance', Cell: formatCurrencyCell },
      { Header: t`Value`, accessor: 'usdAmount', Cell: formatUsdCurrencyCell },
      { Header: `APY`, accessor: 'apy' },
    ],
    []
  )
  const stTokenColumns = useMemo(
    () => [
      { Header: 'IP Token', accessor: 'symbol' },
      {
        Header: t`RSR Rate`,
        accessor: 'exchangeRate',
        Cell: formatCurrencyCell,
      },
      {
        Header: t`Balance`,
        accessor: 'balance',
        Cell: formatCurrencyCell,
      },
      {
        Header: t`RSR Value`,
        accessor: 'rsrAmount',
        Cell: formatCurrencyCell,
      },
      {
        Header: t`USD Value`,
        accessor: 'usdAmount',
        Cell: formatUsdCurrencyCell,
      },
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
          <Table mt={3} columns={rTokenColumns} data={rTokens} />
        </Box>
        <Box>
          <Text variant="sectionTitle">
            <Trans>Your staked RSR positions</Trans>
          </Text>
          <Table mt={3} columns={stTokenColumns} data={stTokens} />
        </Box>
      </Grid>
      <Divider my={5} mx={-5} />
    </Box>
  )
}

export default Portfolio
