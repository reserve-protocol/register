import { t } from '@lingui/macro'
import { Container } from 'components'
import { ContentHead } from 'components/info-box'
import TransactionsTable from 'components/transactions/table'
import { useAtomValue } from 'jotai/utils'
import { recordsAtom, rTokenAtom } from 'state/atoms'
import { Box, Divider, Grid } from 'theme-ui'
import About from './components/About'
import TokenOverview from './components/TokenOverview'
import TokenUsage from './components/TokenUsage'

const dividerProps = { my: 5, mx: -5 }
const gridProps = { columns: [1, 1, 2], gap: 5 }

/**
 * RToken Overview
 * Displays an overview of the RToken Market and transactions stadistics
 *
 * @returns React.Component
 */
const Overview = () => {
  const rToken = useAtomValue(rTokenAtom)
  const txs = useAtomValue(recordsAtom)

  return (
    <Container>
      <TokenOverview />
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <TokenUsage />
        <TransactionsTable
          bordered
          compact
          maxHeight={420}
          title={t`Transactions`}
          data={txs}
        />
      </Grid>
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <About />
      </Grid>
      <Divider {...dividerProps} />
      <Box>Buttons</Box>
      <Divider {...dividerProps} />
      <ContentHead
        title={t`Live & Historical data`}
        subtitle={
          !!rToken?.isRSV
            ? t`Including off-chain in-app transactions of RSV in the Reserve App.`
            : undefined
        }
      />
      <Grid {...gridProps}></Grid>
    </Container>
  )
}

export default Overview
