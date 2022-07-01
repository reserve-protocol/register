import { t, Trans } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { useAtomValue } from 'jotai'
import { recordsAtom } from 'state/atoms'
import { BoxProps, Box, Text, Grid } from 'theme-ui'
import TokenStats from './TokenStats'

const GeneralOverview = (props: BoxProps) => {
  const txs = useAtomValue(recordsAtom)

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
