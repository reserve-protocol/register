import { Box, Divider, Text, Grid } from '@theme-ui/components'
import { Container } from 'components'
import ContentHeader from 'components/layout/content-header'
import TransactionManager from 'state/context/TransactionManager'
import { RequiredApprovedTransactionWorker } from 'state/context/TransactionWorker'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceRecords from './components/records'
import Redeem from './components/redeem'
import TokenInfo from './components/token-info'

const Issuance = () => {
  const RToken = useAppSelector(selectCurrentRToken) as ReserveToken

  return (
    <TransactionManager>
      <RequiredApprovedTransactionWorker
        methods={['issue', 'redeem']}
        autoCalls
      />
      <Container pb={4}>
        <ContentHeader />
        <Grid columns={[2, '2fr 1fr']} gap={5}>
          <TokenInfo symbol={RToken.token.symbol} />
          <Balances rToken={RToken} sx={{ width: 'fit-content' }} />
        </Grid>
        <Divider mt={4} mb={4} sx={{ borderColor: '#DFDFDF' }} />
        <Grid columns={2} gap={4} width={[600, 600]}>
          <Box>
            <Text mb={3} mt={3} variant="sectionTitle" sx={{ fontWeight: 500 }}>
              Mint & Redeem {RToken.token.symbol}
            </Text>
            <Grid columns={2}>
              <Issue data={RToken} />
              <Redeem data={RToken} balance={0} />
            </Grid>
          </Box>
          <IssuanceRecords />
        </Grid>
      </Container>
    </TransactionManager>
  )
}

export default Issuance
