import { t, Trans } from '@lingui/macro'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  accountHoldingsAtom,
  accountPositionsAtom,
  accountTokensAtom,
} from 'state/atoms'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'
import {
  formatCurrency,
  formatCurrencyCell,
  formatUsdCurrencyCell,
} from 'utils'

const Portfolio = (props: BoxProps) => {
  const rTokens = useAtomValue(accountTokensAtom)
  const stTokens = useAtomValue(accountPositionsAtom)
  const holdings = useAtomValue(accountHoldingsAtom)

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

  if (!holdings) {
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
        ${formatCurrency(holdings)}
      </Text>
      <Grid columns={[1, 1, 1, 2]} mt={5} gap={5}>
        <Box>
          <Text pl={3} variant="sectionTitle">
            <Trans>Your RTokens</Trans>
          </Text>
          <Table mt={3} columns={rTokenColumns} data={rTokens} />
          {!rTokens?.length && (
            <Box mt={3} mb={5} sx={{ textAlign: 'center' }}>
              <Text variant="legend">
                <Trans>No rToken holdings</Trans>
              </Text>
            </Box>
          )}
        </Box>
        <Box>
          <Text pl={3} variant="sectionTitle">
            <Trans>Your staked RSR positions</Trans>
          </Text>
          <Table mt={3} columns={stTokenColumns} data={stTokens} />
          {!stTokens?.length && (
            <Box mt={3} mb={5} sx={{ textAlign: 'center' }}>
              <Text variant="legend">
                <Trans>No stake positions</Trans>
              </Text>
            </Box>
          )}
        </Box>
      </Grid>
      <Divider my={6} sx={{ borderColor: 'darkBorder' }} />
    </Box>
  )
}

export default Portfolio
