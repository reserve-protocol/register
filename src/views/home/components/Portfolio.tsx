import { t, Trans } from '@lingui/macro'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import { getRTokenLogo } from 'hooks/useRTokenLogo'
import { localeAtom } from 'i18n'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  accountHoldingsAtom,
  accountPositionsAtom,
  accountTokensAtom,
} from 'state/atoms'
import { Box, Flex, BoxProps, Divider, Text, Grid } from 'theme-ui'
import {
  formatCurrency,
  formatCurrencyCell,
  formatUsdCurrencyCell,
} from 'utils'

const Portfolio = (props: BoxProps) => {
  const lang = useAtomValue(localeAtom)
  const rTokens = useAtomValue(accountTokensAtom)
  const stTokens = useAtomValue(accountPositionsAtom)
  const holdings = useAtomValue(accountHoldingsAtom)

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
    ],
    [lang]
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
    ],
    [lang]
  )

  if (!holdings) {
    return null
  }

  return (
    <Box
      {...props} /* sx={{border: '1px dashed',  borderColor: 'primary', borderRadius: 12}}*/
    >
      <Box>
        <Box ml={3}>
          <Text mb={1} variant="title" sx={{ color: 'secondaryText' }}>
            <Trans>Wallet staked RSR + RToken Value</Trans>
          </Text>
          <Text
            ml={[0, '-1px']}
            sx={{ fontSize: [4, 7], fontWeight: 400, color: 'text' }}
            as="h1"
          >
            ${formatCurrency(holdings)}
          </Text>
        </Box>
        <Box>
          {rTokens?.length > 0 && (
            <Box mt={5}>
              <Text
                pl={3}
                variant="title"
                sx={{ color: 'secondaryText', fontWeight: '400' }}
              >
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
            <Box mt={[2, 5]}>
              <Text
                pl={3}
                variant="title"
                sx={{ color: 'secondaryText', fontWeight: '400' }}
              >
                <Trans>Your staked RSR positions</Trans>
              </Text>
              <Table
                mt={3}
                maxHeight={220}
                columns={stTokenColumns}
                data={stTokens}
              />
            </Box>
          )}
        </Box>
      </Box>
      <Divider mx={[-1, 0]} my={[5, 8]} />
    </Box>
  )
}

export default Portfolio
