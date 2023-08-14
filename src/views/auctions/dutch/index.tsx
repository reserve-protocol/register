import { Box } from 'theme-ui'
import DutchAuction from './components/DutchAuction'
import OngoingDutchAuctions from './components/OngoingDutchAuctions'
import { gql } from 'graphql-request'
import { Button } from 'components'
import useDutchTrades from './components/useDutchTrades'

const tradesQuery = gql`
  query Trades($id: String!, $time: Int!) {
    current: trades(
      where: { endAt_gt: $time, rToken: $id }
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      auctionId
      buying
      buyingTokenSymbol
      sellingTokenSymbol
      endAt
      selling
      startedAt
      worstCasePrice
    }
    ended: trades(
      where: { endAt_lte: $time, rToken: $id }
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      auctionId
      buying
      buyingTokenSymbol
      sellingTokenSymbol
      endAt
      selling
      startedAt
      worstCasePrice
    }
  }
`

const DutchAuctions = () => {
  useDutchTrades()

  return (
    <Box>
      <OngoingDutchAuctions />
    </Box>
  )
}

export default DutchAuctions
