import { t, Trans } from '@lingui/macro'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import { getRTokenLogo } from 'hooks/useRTokenLogo'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  accountHoldingsAtom,
  accountPositionsAtom,
  accountTokensAtom,
} from 'state/atoms'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
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
      {
        Header: 'RToken',
        accessor: 'symbol',
        Cell: (data: any) => {
          const logo = getRTokenLogo(data.row.original.address)

          return <TokenItem symbol={data.cell.value} logo={logo} />
        },
      },
      { Header: t`Price`, accessor: 'usdPrice', Cell: formatUsdCurrencyCell },
      { Header: t`Balance`, accessor: 'balance', Cell: formatCurrencyCell },
      { Header: t`Value`, accessor: 'usdAmount', Cell: formatUsdCurrencyCell },
      {
        Header: `APY`,
        accessor: 'apy',
        Cell: ({ cell }: { cell: any }) => `${cell.value}%`,
      },
    ],
    []
  )
  const stTokenColumns = useMemo(
    () => [
      {
        Header: 'IP Token',
        accessor: 'symbol',
        Cell: (data: any) => {
          return <TokenItem symbol={data.cell.value} logo="/svgs/strsr.svg" />
        },
      },
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
      {
        Header: 'APY',
        accessor: 'apy',
        Cell: ({ cell }: { cell: any }) => `${cell.value}%`,
      },
    ],
    []
  )

  if (!holdings) {
    return null
  }

  return (
    <Box {...props}>
      <Box ml={3} mt={2}>
        <Text variant="sectionTitle">
          <Trans>Staked RSR + Rtoken Value</Trans>
        </Text>
        <Text
          mt={0}
          pt={0}
          sx={{ fontSize: [4, 7], fontWeight: 400, color: 'boldText' }}
          as="h1"
        >
          ${formatCurrency(holdings)}
        </Text>
      </Box>
      {rTokens?.length > 0 && (
        <Box mt={5}>
          <Text pl={3} variant="sectionTitle">
            <Trans>Your RTokens</Trans>
          </Text>
          <Table
            mt={3}
            maxHeight={220}
            columns={rTokenColumns}
            data={rTokens}
          />
        </Box>
      )}
      {stTokens?.length > 0 && (
        <Box mt={5}>
          <Text pl={3} variant="sectionTitle">
            <Trans>Your staked RSR positions</Trans>
          </Text>
          <Table
            mt={3}
            mb="-16px"
            maxHeight={220}
            columns={stTokenColumns}
            data={stTokens}
          />
        </Box>
      )}
      <Divider mx={-5} my={6} sx={{ borderColor: 'darkBorder' }} />
    </Box>
  )
}

export default Portfolio
