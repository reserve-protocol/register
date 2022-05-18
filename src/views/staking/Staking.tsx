import { useWeb3React } from '@web3-react/core'
import { Container } from 'components'
import TransactionHistory from 'components/transaction-history'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, Divider, Grid, Text } from 'theme-ui'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Stake from './components/stake'
import Unstake from './components/unstake'
import Withdrawals from './components/withdrawals'

const Staking = () => {
  // This component is protected by a guard, RToken always exists
  const RToken = useAtomValue(rTokenAtom) as ReserveToken

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
    </Container>
  )
}

export default Staking
