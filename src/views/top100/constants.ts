import { PERMISSIONLESS_VOTE_LOCK } from '@/views/index-dtf/deploy/permissionless-defaults'
import { ChainId } from '@/utils/chains'
import { Address, zeroAddress } from 'viem'
import { gql } from 'graphql-request'

// Only include chains with real governance addresses
export const ACTIVE_CHAINS = [ChainId.Base, ChainId.Mainnet, ChainId.BSC].filter(
  (chainId) =>
    PERMISSIONLESS_VOTE_LOCK[chainId] &&
    PERMISSIONLESS_VOTE_LOCK[chainId] !== zeroAddress
)

// DTFs hidden from the top100 list, keyed by chainId (lowercase addresses)
export const BLOCKED_DTFS: Record<number, Set<string>> = {
  [ChainId.Base]: new Set([
    '0xecbc4a20a2309aff75aee99f46b31a9aa3bfd3e1',
    '0x447d632c7b10ac7936ddc131c2d76002ceba7267',
  ]),
}

// DTFs manually included in the top100 list (not discovered via governance query)
export const ALLOWED_DTFS: Record<number, Address[]> = {
  [ChainId.Mainnet]: ['0x1d55940cf6eb85321816327aa785006f8dd59ef9'],
}

// All chains that may have DTFs in the top100 (active + allowed)
const allowedChains = Object.keys(ALLOWED_DTFS).map(Number)
export const ALL_TOP100_CHAINS = [
  ...new Set([...ACTIVE_CHAINS, ...allowedChains]),
]

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

export const DTF_BY_ID_QUERY = gql`
  query GetDTFById($id: ID!) {
    dtf(id: $id) {
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
