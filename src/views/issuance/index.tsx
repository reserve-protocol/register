import { Box, Divider, Grid, Text } from '@theme-ui/components'
import { Container } from 'components'
import TransactionManager from 'state/context/TransactionManager'
import { RequiredApprovedTransactionWorker } from 'state/context/TransactionWorker'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceRecords from './components/records'
import Redeem from './components/redeem'

const Issuance = () => {
  const RToken = useAppSelector(selectCurrentRToken) as ReserveToken
  const balance =
    useAppSelector(
      ({ reserveTokens }) => reserveTokens.balances[RToken.token.address]
    ) || 0

  return (
    <TransactionManager>
      <RequiredApprovedTransactionWorker
        methods={['issue', 'redeem']}
        autoCalls
      />
      <Container pb={4}>
        <Grid columns={[2, '2fr 1fr']} gap={4}>
          <Box>
            <Text mb={3} variant="sectionTitle" sx={{ fontWeight: 500 }}>
              Mint & Redeem {RToken.token.symbol}
            </Text>
            <Grid columns={2}>
              <Issue data={RToken} />
              <Redeem data={RToken} max={balance} />
            </Grid>
          </Box>
          <Balances rToken={RToken} />
        </Grid>
        <Divider mt={4} mb={4} sx={{ borderColor: '#DFDFDF' }} />
        <IssuanceRecords token={RToken.token.address} />
      </Container>
    </TransactionManager>
  )
}

export default Issuance
