import { PERMISSIONLESS_VOTE_LOCK } from '@/views/index-dtf/deploy/permissionless-defaults'
import { ChainId } from '@/utils/chains'
import { zeroAddress } from 'viem'
import { gql } from 'graphql-request'

// Only include chains with real governance addresses
export const ACTIVE_CHAINS = [ChainId.Base, ChainId.Mainnet, ChainId.BSC].filter(
  (chainId) =>
    PERMISSIONLESS_VOTE_LOCK[chainId] &&
    PERMISSIONLESS_VOTE_LOCK[chainId] !== zeroAddress
)

export const TOP100_QUERY = gql`
  query GetTop100DTFs($first: Int!, $voteLockAddress: String!) {
    dtfs(
      first: $first
      where: { ownerGovernance_: { token: $voteLockAddress } }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      timestamp
      token {
        name
        symbol
        totalSupply
        currentHolderCount
      }
    }
  }
`
