import { Box, Divider, Grid, Text } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { Container } from 'components'
import TransactionHistory from 'components/transaction-history'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { balancesAtom, rTokenAtom } from 'state/atoms'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'
import About from './components/about'

const Issuance = () => {
  const RToken = useAtomValue(rTokenAtom) as ReserveToken
  const balance = useAtomValue(balancesAtom)[RToken.token.address]

  return (
    <Container pb={4}>
      <Grid columns={[2, '2fr 1fr']} gap={4}>
        <Box>
          <Text mb={3} variant="sectionTitle">
            Mint & Redeem {RToken.token.symbol}
          </Text>
          <Grid columns={2} gap={4} mb={3}>
            <Issue data={RToken} />
            <Redeem data={RToken} max={balance} />
          </Grid>
          <Balances rToken={RToken} />
        </Box>
        <About />
      </Grid>
    </Container>
  )
}

export default Issuance
