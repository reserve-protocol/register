import { t } from '@lingui/macro'
import { Container } from 'components'
import { ContentHead } from 'components/info-box'
import TransactionsTable from 'components/transactions/table'
import { useAtomValue } from 'jotai/utils'
import { recordsAtom, rTokenAtom } from 'state/atoms'
import { Box, Divider, Grid } from 'theme-ui'
import About from './components/About'
import AssetOverview from './components/AssetOverview'
import TokenOverview from './components/TokenOverview'
import TokenUsage from './components/TokenUsage'

const dividerProps = { my: 5, mx: -5 }
const gridProps = { columns: [1, 1, 1, 2], gap: 6 }

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
          help="TODO"
          title={t`Transactions`}
          data={txs}
        />
      </Grid>
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <About />
        <AssetOverview />
      </Grid>
      <Divider {...dividerProps} />
      <Box>Buttons</Box>
      <Divider {...dividerProps} />
      <ContentHead
        title={t`Live & Historical data`}
        mb={4}
        subtitle={
          !!rToken?.isRSV
            ? t`Including off-chain in-app transactions of RSV in the Reserve App.`
            : undefined
        }
      />
      <Grid {...gridProps}>
        <Box>Charts TODO</Box>
        <TransactionsTable
          bordered
          compact
          maxHeight={420}
          title={t`Protocol Transactions`}
          help="TODO"
          data={txs}
        />
      </Grid>
      <Divider {...dividerProps} />
      <ContentHead
        title={t`Contract addresses`}
        mb={4}
        subtitle={t`Explorer links to all the official relevant smart contracts.`}
      />
    </Container>
  )
}

export default Overview
