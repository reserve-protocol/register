# DTF Index Subgraph Documentation

## Overview

The DTF Index Subgraph indexes blockchain data for Index DTFs (Decentralized Token Folios) across multiple chains. This documentation is optimized for LLMs to build GraphQL queries efficiently.

## Infrastructure

### Subgraph URLs

```typescript
const INDEX_DTF_SUBGRAPH_URL = {
  [ChainId.Mainnet]: 'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-mainnet/api',
  [ChainId.Base]: 'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-base/api',
  [ChainId.BSC]: 'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-bsc/api',
}
```

**Note**: Arbitrum is deprecated for Index DTFs. Never query Arbitrum for Index DTF data.

### GraphQL Clients

```typescript
import { GraphQLClient } from 'graphql-request'

const INDEX_GRAPH_CLIENTS = {
  [ChainId.Mainnet]: new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[ChainId.Mainnet]),
  [ChainId.Base]: new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[ChainId.Base]),
  [ChainId.BSC]: new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[ChainId.BSC]),
}
```

## Schema Entities

### Core Entities

#### DTF Entity
The main entity representing an Index DTF.

```graphql
type DTF {
  id: ID!                        # DTF contract address (lowercase)
  token: Token!                  # Associated ERC20 token
  totalRevenue: BigInt!          # Total revenue collected
  protocolRevenue: BigInt!      # Revenue for protocol
  governanceRevenue: BigInt!    # Revenue for governance
  externalRevenue: BigInt!      # Revenue for external recipients
  deployer: Bytes!              # Deployer address
  proxyAdmin: Bytes!            # Proxy admin address
  mintingFee: BigInt!           # Fee for minting (D18)
  tvlFee: BigInt!               # TVL fee (D18)
  annualizedTvlFee: BigInt!     # Annualized TVL fee (D18)
  auctionDelay: BigInt!         # Delay before auctions
  auctionLength: BigInt!        # Length of auctions
  mandate: String!              # DTF mandate/description
  weightControl: Boolean!       # Native DTF (true) vs Tracking DTF (false)
  priceControl: Int!            # Price control level (5, 10, 50)
  auctionApprovers: [String!]!  # List of auction approvers
  auctionLaunchers: [String!]!  # List of auction launchers
  brandManagers: [String!]!     # List of brand managers
  admins: [String!]!            # List of admins
  stToken: StakingToken         # Associated staking token
  stTokenAddress: Bytes         # Staking token address (backup)
  ownerAddress: Bytes!          # Owner address (timelock for governed)
  ownerGovernance: Governance   # Owner governance framework
  tradingGovernance: Governance # Trading governance framework
  blockNumber: BigInt!          # Deployment block
  timestamp: BigInt!            # Deployment timestamp
  feeRecipients: String!        # Fee recipients (format: "address:percentage,...")
  rebalances: [Rebalance!]!     # Associated rebalances
}
```

#### Token Entity
Represents ERC20 tokens tracked by the subgraph.

```graphql
type Token {
  id: ID!                          # Token address (lowercase)
  address: Bytes!                  # Token address
  name: String!                    # Token name
  symbol: String!                  # Token symbol
  decimals: Int!                   # Token decimals
  totalSupply: BigInt!            # Total supply
  currentHolderCount: BigInt!     # Current number of holders
  holders: [AccountBalance!]!     # Token holders
  isIndex: Boolean!               # Is this an index token?
  dailySnapshots: [TokenDailySnapshot!]!
  hourlySnapshots: [TokenHourlySnapshot!]!
}
```

#### Rebalance Entity
Tracks rebalancing operations for DTFs.

```graphql
type Rebalance {
  id: ID!                      # {DTF Address}-{Rebalance ID}
  nonce: BigInt!               # Rebalance nonce
  dtf: DTF!                    # Associated DTF
  tokens: [Token!]!            # Tokens in rebalance
  priceControl: String!        # Price control setting
  weightLowLimit: [BigInt!]!   # Weight lower limits
  weightSpotLimit: [BigInt!]!  # Weight spot limits
  weightHighLimit: [BigInt!]!  # Weight upper limits
  rebalanceLowLimit: BigInt!   # Rebalance lower limit
  rebalanceSpotLimit: BigInt!  # Rebalance spot limit
  rebalanceHighLimit: BigInt!  # Rebalance upper limit
  priceLowLimit: [BigInt!]!    # Price lower limits
  priceHighLimit: [BigInt!]!   # Price upper limits
  restrictedUntil: BigInt!     # Auction launcher window end
  availableUntil: BigInt!      # Available until timestamp
  transactionHash: String!     # Transaction hash
  blockNumber: BigInt!         # Block number
  timestamp: BigInt!           # Timestamp
  auctions: [Auction!]!        # Associated auctions
}
```

#### Auction Entity
Represents individual auctions during rebalancing.

```graphql
type Auction {
  id: ID!                           # {DTF Address}-{Rebalance ID}-{Auction ID}
  dtf: DTF!                         # Associated DTF
  rebalance: Rebalance!             # Associated rebalance
  tokens: [Token!]!                 # Auctioned tokens
  sellAmounts: [BigInt!]!           # Amounts to sell
  buyAmounts: [BigInt!]!            # Amounts to buy
  fillPercent: BigInt!              # Fill percentage
  hasWithdrawn: Boolean!            # Has been withdrawn
  transactionHash: String!          # Transaction hash
  blockNumber: BigInt!              # Block number
  timestamp: BigInt!                # Timestamp
  bids: [RebalanceAuctionBid!]!    # Auction bids
}
```

### Governance Entities

#### Governance Entity
Represents a governance framework (Owner or Trading).

```graphql
type Governance {
  id: ID!                        # Governance contract address
  type: String!                  # "OWNER" or "TRADING"
  governor: Bytes!               # Governor contract
  timelock: Timelock!            # Associated timelock
  token: StakingToken            # Voting token
  votingDelay: BigInt!          # Voting delay in blocks
  votingPeriod: BigInt!         # Voting period in blocks
  proposalThreshold: BigInt!    # Proposal threshold
  quorumNumerator: BigInt!      # Quorum numerator
  quorumDenominator: BigInt!    # Quorum denominator
  proposals: [Proposal!]!       # Associated proposals
  proposalCount: BigInt!        # Total proposals
  voteCount: BigInt!           # Total votes
  delegateCount: BigInt!       # Total delegates
}
```

#### Proposal Entity
Represents governance proposals.

```graphql
type Proposal {
  id: ID!                          # {Governance Address}-{Proposal ID}
  governance: Governance!          # Associated governance
  proposalId: BigInt!             # On-chain proposal ID
  timelockId: Bytes               # Timelock operation ID
  proposer: Delegate!             # Proposal creator
  description: String!            # Proposal description
  targets: [Bytes!]!              # Target addresses
  signatures: [String!]!          # Function signatures
  calldatas: [Bytes!]!           # Call data
  values: [BigInt!]!             # ETH values
  voteStart: BigInt!             # Vote start block/time
  voteEnd: BigInt!               # Vote end block/time
  state: String!                 # Current state
  forWeightedVotes: BigInt!     # Weighted votes for
  againstWeightedVotes: BigInt! # Weighted votes against
  abstainWeightedVotes: BigInt! # Weighted abstain votes
  quorumVotes: BigInt!          # Quorum requirement
  executionETA: BigInt          # Execution ETA (if queued)
  executionTime: BigInt         # Actual execution time
  cancellationTime: BigInt      # Cancellation time
  votes: [Vote!]!               # Individual votes
}
```

#### Vote Entity
Individual votes on proposals.

```graphql
type Vote {
  id: ID!                    # {Proposal ID}-{Voter Address}
  proposal: Proposal!        # Associated proposal
  voter: Delegate!          # Voter
  choice: String!           # "FOR", "AGAINST", or "ABSTAIN"
  weight: BigInt!           # Vote weight
  reason: String            # Vote reason (optional)
  blockNumber: BigInt!      # Vote block
  timestamp: BigInt!        # Vote timestamp
}
```

### Staking Entities

#### StakingToken Entity
Represents staking/voting tokens.

```graphql
type StakingToken {
  id: ID!                           # Staking token address
  underlying: Token                 # Underlying token
  token: Token!                     # Staking token itself
  governance: Governance             # Associated governance
  legacyGovernance: [String!]!     # Legacy governance addresses
  currentDelegates: BigInt!        # Current delegate count
  totalDelegates: BigInt!          # Total historical delegates
  delegatedVotesRaw: BigInt!       # Total delegated votes (raw)
  delegatedVotes: BigDecimal!      # Total delegated votes (normalized)
  delegates: [Delegate!]!          # All delegates
  dtfs: [DTF!]!                   # Associated DTFs
  daos: [Governance!]!            # Associated DAOs
  rewards: [StakingTokenRewards!]! # Reward tokens
}
```

#### Delegate Entity
Represents voting delegates.

```graphql
type Delegate {
  id: ID!                              # {StToken Address}-{Delegate Address}
  address: String!                     # Delegate address
  token: StakingToken!                 # Associated staking token
  delegatedVotesRaw: BigInt!          # Delegated votes (raw)
  delegatedVotes: BigDecimal!         # Delegated votes (normalized)
  tokenHoldersRepresentedAmount: Int!  # Number of token holders represented
  tokenHoldersRepresented: [AccountBalance!]!  # Token holders
  votes: [Vote!]!                     # Votes cast
  numberVotes: Int!                   # Number of votes
  proposals: [Proposal!]!             # Proposals created
}
```

#### Lock Entity
Represents locked tokens for voting.

```graphql
type Lock {
  id: ID!                    # {StakingToken Address}-{Lock ID}
  lockId: BigInt!           # Lock ID
  token: StakingToken!      # Associated staking token
  amount: BigInt!           # Locked amount
  account: Account!         # Account that locked
  unlockTime: BigInt!       # Unlock timestamp
  createdBlock: BigInt!     # Creation block
  createdTimestamp: BigInt! # Creation timestamp
  createdTxnHash: String!   # Creation transaction
  cancelledBlock: BigInt    # Cancellation block (if cancelled)
  cancelledTimestamp: BigInt # Cancellation timestamp
  cancelledTxnHash: String  # Cancellation transaction
  claimedBlock: BigInt      # Claim block (if claimed)
  claimedTimestamp: BigInt  # Claim timestamp
  claimedTxnHash: String    # Claim transaction
}
```

### Account Entities

#### Account Entity
Represents Ethereum addresses.

```graphql
type Account {
  id: ID!                        # Account address (lowercase)
  address: Bytes!               # Account address
  balances: [AccountBalance!]!  # Token balances
  locks: [Lock!]!              # Token locks
}
```

#### AccountBalance Entity
Token balance for an account.

```graphql
type AccountBalance {
  id: ID!                    # {Account Address}-{Token Address}
  account: Account!          # Account
  token: Token!             # Token
  balance: BigInt!          # Balance
  delegate: Delegate        # Voting delegate (if applicable)
}
```

## Common Query Patterns

### Single DTF Query

```graphql
query GetDTF($id: String!) {
  dtf(id: $id) {
    id
    token {
      name
      symbol
      decimals
      totalSupply
      currentHolderCount
    }
    mintingFee
    tvlFee
    annualizedTvlFee
    mandate
    ownerGovernance {
      votingDelay
      votingPeriod
      proposalThreshold
      quorumNumerator
      quorumDenominator
      timelock {
        guardians
        executionDelay
      }
    }
    tradingGovernance {
      votingDelay
      votingPeriod
      proposalThreshold
      quorumNumerator
      quorumDenominator
      timelock {
        guardians
        executionDelay
      }
    }
    stToken {
      token {
        name
        symbol
        totalSupply
      }
      governance {
        votingDelay
        votingPeriod
      }
      rewards(where: { active: true }) {
        rewardToken {
          address
          name
          symbol
        }
      }
    }
  }
}
```

### Multiple DTFs Query with Filters

```graphql
query GetDTFs(
  $first: Int!
  $skip: Int!
  $orderBy: String!
  $orderDirection: String!
  $where: DTF_filter
) {
  dtfs(
    first: $first
    skip: $skip
    orderBy: $orderBy
    orderDirection: $orderDirection
    where: $where
  ) {
    id
    timestamp
    token {
      name
      symbol
      totalSupply
      currentHolderCount
    }
    ownerGovernance {
      id
    }
    tradingGovernance {
      id
    }
  }
}
```

### Governance Proposals Query

```graphql
query GetProposals($governance: String!, $first: Int!, $skip: Int!) {
  proposals(
    where: { governance: $governance }
    first: $first
    skip: $skip
    orderBy: creationTime
    orderDirection: desc
  ) {
    id
    proposalId
    description
    state
    voteStart
    voteEnd
    forWeightedVotes
    againstWeightedVotes
    abstainWeightedVotes
    quorumVotes
    proposer {
      address
    }
    votes {
      voter {
        address
      }
      choice
      weight
    }
  }
}
```

### Rebalance and Auctions Query

```graphql
query GetRebalances($dtf: String!, $first: Int!) {
  rebalances(
    where: { dtf: $dtf }
    first: $first
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    nonce
    tokens {
      symbol
      address
    }
    restrictedUntil
    availableUntil
    auctions {
      id
      sellAmounts
      buyAmounts
      fillPercent
      hasWithdrawn
      timestamp
      bids {
        id
        buyAmount
        sellAmount
        bidder
        timestamp
      }
    }
  }
}
```

### Token Holders Query

```graphql
query GetTokenHolders($token: String!, $minBalance: BigInt!) {
  accountBalances(
    where: {
      token: $token
      balance_gte: $minBalance
    }
    orderBy: balance
    orderDirection: desc
    first: 100
  ) {
    account {
      address
    }
    balance
    delegate {
      address
    }
  }
}
```

## Multichain Query Pattern

To query across multiple chains, use parallel requests:

```typescript
import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { ChainId } from '@/utils/chains'

const fetchMultichainDTFs = async () => {
  const chains = [ChainId.Base, ChainId.Mainnet, ChainId.BSC]
  const allDTFs = []

  for (const chainId of chains) {
    try {
      const client = INDEX_GRAPH_CLIENTS[chainId]
      const response = await client.request(dtfsQuery, {
        first: 100,
        skip: 0,
        orderBy: 'timestamp',
        orderDirection: 'desc'
      })

      // Add chainId to each DTF
      const dtfsWithChain = response.dtfs.map(dtf => ({
        ...dtf,
        chainId
      }))

      allDTFs.push(...dtfsWithChain)
    } catch (error) {
      console.error(`Failed to fetch from chain ${chainId}:`, error)
    }
  }

  // Sort across all chains
  return allDTFs.sort((a, b) => b.timestamp - a.timestamp)
}
```

## Filter Examples

### Filter by Governance Type
```graphql
where: {
  ownerGovernance_not: null  # Has owner governance
  tradingGovernance_not: null  # Has trading governance
}
```

### Filter by Time Range
```graphql
where: {
  timestamp_gte: "1609459200"  # After Jan 1, 2021
  timestamp_lte: "1640995200"  # Before Jan 1, 2022
}
```

### Filter by Fee Range
```graphql
where: {
  mintingFee_lte: "1000000000000000"  # <= 0.1% (0.001 * 10^18)
  tvlFee_gte: "0"
}
```

### Filter by Token Holders
```graphql
where: {
  token_: {
    currentHolderCount_gte: 100
  }
}
```

## Data Type Notes

### BigInt Fields
- All numeric values are stored as BigInt strings
- Fees are in D18 format (18 decimals)
- To convert: `Number(formatEther(BigInt(value)))`

### Address Fields
- All addresses are stored as lowercase hex strings
- Type `Bytes` or `ID` in schema
- Always lowercase addresses before querying

### Timestamp Fields
- Unix timestamps in seconds (not milliseconds)
- Convert for JavaScript: `new Date(timestamp * 1000)`

### State Fields
- Proposal states: "PENDING", "ACTIVE", "CANCELED", "DEFEATED", "SUCCEEDED", "QUEUED", "EXPIRED", "EXECUTED"
- Vote choices: "FOR", "AGAINST", "ABSTAIN"

## Hook Usage

### Using the Standard Hook
```typescript
import useIndexDTFSubgraph from '@/hooks/useIndexDTFSubgraph'

const MyComponent = () => {
  const { data, isLoading, error } = useIndexDTFSubgraph(
    query,
    variables,
    { staleTime: 60000 },
    ChainId.Base
  )

  // Handle data...
}
```

### Direct GraphQL Client Usage
```typescript
import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { gql } from 'graphql-request'

const fetchData = async () => {
  const client = INDEX_GRAPH_CLIENTS[ChainId.Base]
  const data = await client.request(query, variables)
  return data
}
```