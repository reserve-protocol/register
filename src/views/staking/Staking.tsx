import { Box, Divider, Grid, Text } from '@theme-ui/components'
import { useWeb3React } from '@web3-react/core'
import { Container } from 'components'
import TransactionHistory from 'components/transaction-history'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Stake from './components/stake'
import Unstake from './components/unstake'
import Withdrawals from './components/withdrawals'

const getHistory = gql`
    entries(
      where: {
        type_in: ["Stake", "Unstake", "Withdraw"]
        user: $userId
        token: $token
      }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      type
      amount
      createdAt
      transaction {
        id
      }
    }
  }
`

const Staking = () => {
  // This component is protected by a guard, RToken always exists
  const RToken = useAtomValue(rTokenAtom) as ReserveToken
  const { account } = useWeb3React()
  const { data } = useQuery(getHistory, {
    where: {},
    userId: account?.toLowerCase(),
    token: RToken.insurance!.token.address,
  })

  return (
    <Container pt={4} pb={4}>
      <Grid columns={[2, '2fr 1fr']} gap={4}>
        <Box>
          <Text mb={2} variant="sectionTitle">
            Insurance
          </Text>
          <Grid columns={2} mb={3}>
            <Stake data={RToken} />
            <Unstake data={RToken} />
          </Grid>
        </Box>
        <Box>
          <Balances rToken={RToken} />
          <Text mt={3} mb={2} variant="sectionTitle">
            Withdrawals
          </Text>
          <Withdrawals tokenAddress={RToken.insurance?.token.address ?? ''} />
        </Box>
      </Grid>
      <Divider mt={4} mb={4} sx={{ borderColor: '#DFDFDF' }} />
      <Text mb={3} variant="sectionTitle">
        Transactions
      </Text>
      <TransactionHistory history={data?.entries ?? []} />
    </Container>
  )
}

export default Staking
