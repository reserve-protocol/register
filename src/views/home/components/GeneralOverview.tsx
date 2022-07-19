import { formatEther } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useMemo } from 'react'
import { Box, BoxProps, Grid, Text } from 'theme-ui'
import TokenStats from './TokenStats'

const protocolRecentTxsQuery = gql`
  query GetProtocolRecentTransactions {
    entries(orderBy: timestamp, orderDirection: desc, first: 10) {
      type
      amount
      amountUSD
      hash
      timestamp
    }
  }
`

const GeneralOverview = (props: BoxProps) => {
  // TODO: poll on blocknumber change
  const { data } = useQuery(protocolRecentTxsQuery)
  const txs = useMemo(() => {
    if (!data?.entries) {
      return []
    }

    // TODO: Parse type depending on lang
    return data.entries.map((tx: any) => ({
      ...tx,
      amount: Number(formatEther(tx.amount)),
    }))
  }, [data])

  return (
    <Box>
      <Text
        variant="sectionTitle"
        sx={{ fontSize: 4, color: 'boldText' }}
        mb={5}
      >
        <Trans>General RToken Overview</Trans>
      </Text>
      <Grid columns={[1, 1, 1, 2]} gap={5}>
        <TokenStats />
        <Box>
          <TransactionsTable
            compact
            card
            maxHeight={420}
            title={t`Recent Transactions`}
            help="TODO"
            data={txs}
          />
        </Box>
      </Grid>
    </Box>
  )
}

export default GeneralOverview
