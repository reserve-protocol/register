# DTF Index Subgraph Query Builder Guide

This guide helps LLMs construct efficient GraphQL queries for the DTF Index Subgraph.

## Query Structure

### Basic Query Template
```graphql
query QueryName($variable1: Type!, $variable2: Type) {
  entityName(
    id: $variable1           # For single entity
    where: { ... }          # For filtering
    first: 100              # Pagination limit
    skip: 0                 # Pagination offset
    orderBy: fieldName      # Sort field
    orderDirection: desc    # Sort direction (asc/desc)
  ) {
    field1
    field2
    nestedEntity {
      nestedField1
      nestedField2
    }
  }
}
```

## Query Building Blocks

### 1. Single Entity Queries

When fetching a single entity by ID:
```graphql
query GetEntity($id: String!) {
  entity(id: $id) {
    # fields
  }
}
```

**Important**: Always lowercase the ID for addresses
```typescript
const id = address.toLowerCase()
```

### 2. Multiple Entity Queries

When fetching lists:
```graphql
query GetEntities(
  $first: Int!
  $skip: Int!
  $where: Entity_filter
  $orderBy: Entity_orderBy
  $orderDirection: OrderDirection
) {
  entities(
    first: $first
    skip: $skip
    where: $where
    orderBy: $orderBy
    orderDirection: $orderDirection
  ) {
    # fields
  }
}
```

### 3. Filter Patterns

#### Equality Filters
```graphql
where: {
  field: "value"              # Exact match
  field_not: "value"          # Not equal
  field_in: ["val1", "val2"]  # In list
  field_not_in: ["val1"]      # Not in list
}
```

#### Comparison Filters
```graphql
where: {
  field_gt: "100"    # Greater than
  field_gte: "100"   # Greater than or equal
  field_lt: "100"    # Less than
  field_lte: "100"   # Less than or equal
}
```

#### Null Checks
```graphql
where: {
  field: null        # Is null
  field_not: null    # Is not null
}
```

#### String Filters
```graphql
where: {
  field_contains: "text"          # Contains substring
  field_contains_nocase: "TEXT"   # Case-insensitive contains
  field_starts_with: "prefix"     # Starts with
  field_ends_with: "suffix"       # Ends with
}
```

#### Nested Entity Filters
Use underscore to filter by nested fields:
```graphql
where: {
  nestedEntity_: {
    field_gte: "100"
  }
}
```

### 4. Sorting Patterns

Common sort fields by entity:

#### DTF Sorting
```graphql
orderBy: timestamp         # Deployment time
orderBy: totalRevenue      # Total revenue
orderBy: token__totalSupply # Token supply (nested)
```

#### Proposal Sorting
```graphql
orderBy: creationTime      # Creation time
orderBy: voteEnd          # Vote end time
orderBy: forWeightedVotes # Support level
```

#### Token Sorting
```graphql
orderBy: totalSupply       # Total supply
orderBy: currentHolderCount # Number of holders
```

### 5. Pagination Patterns

#### Standard Pagination
```graphql
# Page 1 (items 0-99)
first: 100, skip: 0

# Page 2 (items 100-199)
first: 100, skip: 100

# Page 3 (items 200-299)
first: 100, skip: 200
```

#### Cursor-based Pagination
```graphql
# First page
first: 100, where: { id_gt: "" }

# Next pages using last ID from previous result
first: 100, where: { id_gt: "0xlastid" }
```

## Common Query Recipes

### 1. Get All Governed DTFs
```graphql
query GetGovernedDTFs($first: Int!, $skip: Int!) {
  dtfs(
    where: {
      ownerGovernance_not: null
    }
    first: $first
    skip: $skip
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    token { name, symbol }
    ownerGovernance {
      votingDelay
      votingPeriod
    }
  }
}
```

### 2. Get Active Proposals
```graphql
query GetActiveProposals($now: BigInt!) {
  proposals(
    where: {
      voteStart_lte: $now
      voteEnd_gte: $now
      state: "ACTIVE"
    }
    orderBy: voteEnd
    orderDirection: asc
  ) {
    id
    description
    voteEnd
    forWeightedVotes
    againstWeightedVotes
  }
}
```

### 3. Get Top Token Holders
```graphql
query GetTopHolders($token: String!) {
  accountBalances(
    where: {
      token: $token
      balance_gt: "0"
    }
    orderBy: balance
    orderDirection: desc
    first: 100
  ) {
    account { address }
    balance
  }
}
```

### 4. Get Recent Rebalances
```graphql
query GetRecentRebalances($dtf: String!, $since: BigInt!) {
  rebalances(
    where: {
      dtf: $dtf
      timestamp_gte: $since
    }
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    nonce
    timestamp
    auctions {
      fillPercent
      hasWithdrawn
    }
  }
}
```

### 5. Get DTFs with High TVL Fee
```graphql
query GetHighFeeDTFs {
  dtfs(
    where: {
      tvlFee_gte: "10000000000000000" # >= 1%
    }
    orderBy: tvlFee
    orderDirection: desc
    first: 50
  ) {
    id
    token { name, symbol }
    tvlFee
    annualizedTvlFee
  }
}
```

### 6. Get Delegated Voting Power
```graphql
query GetDelegates($token: String!) {
  delegates(
    where: {
      token: $token
      delegatedVotesRaw_gt: "0"
    }
    orderBy: delegatedVotesRaw
    orderDirection: desc
    first: 50
  ) {
    address
    delegatedVotesRaw
    tokenHoldersRepresentedAmount
    numberVotes
  }
}
```

## Multichain Query Strategy

### Parallel Fetch Pattern
```typescript
const fetchFromAllChains = async (query, variables) => {
  const chains = [ChainId.Base, ChainId.Mainnet, ChainId.BSC]

  const promises = chains.map(chainId =>
    INDEX_GRAPH_CLIENTS[chainId]
      .request(query, variables)
      .then(data => ({ ...data, chainId }))
      .catch(err => {
        console.error(`Chain ${chainId} failed:`, err)
        return null
      })
  )

  const results = await Promise.all(promises)
  return results.filter(Boolean)
}
```

### Sequential Fetch Pattern (Rate Limit Friendly)
```typescript
const fetchSequentially = async (query, variables) => {
  const chains = [ChainId.Base, ChainId.Mainnet, ChainId.BSC]
  const results = []

  for (const chainId of chains) {
    try {
      const data = await INDEX_GRAPH_CLIENTS[chainId]
        .request(query, variables)
      results.push({ ...data, chainId })
    } catch (error) {
      console.error(`Chain ${chainId} failed:`, error)
    }
  }

  return results
}
```

### Aggregation Pattern
```typescript
const aggregateMultichainData = (results) => {
  // Flatten entities from all chains
  const allEntities = results.flatMap(r => r.entities || [])

  // Add chain info to each entity
  const withChainInfo = results.flatMap((r, i) =>
    r.entities.map(e => ({ ...e, chainId: chains[i] }))
  )

  // Sort by common field (e.g., timestamp)
  return withChainInfo.sort((a, b) => b.timestamp - a.timestamp)
}
```

## Performance Tips

### 1. Request Only Needed Fields
❌ Bad: Requesting all fields
```graphql
dtf(id: $id) {
  # 50+ fields...
}
```

✅ Good: Request specific fields
```graphql
dtf(id: $id) {
  id
  token { name, symbol }
  mintingFee
}
```

### 2. Use Appropriate Pagination
- First query: `first: 100` to check data size
- Large datasets: Use cursor pagination
- Real-time data: Smaller pages (10-25 items)

### 3. Cache Strategy
```typescript
const { data } = useQuery({
  queryKey: ['dtfs', chainId, page],
  queryFn: fetchDTFs,
  staleTime: 60000,     // 1 minute
  cacheTime: 300000,    // 5 minutes
})
```

### 4. Batch Related Queries
Instead of multiple queries, use one with all needed data:
```graphql
query GetDTFComplete($id: String!) {
  dtf(id: $id) {
    # DTF fields
    rebalances(first: 5, orderBy: timestamp, orderDirection: desc) {
      # Recent rebalances
    }
  }
  proposals(where: { governance_: { dtfs_contains: [$id] } }, first: 5) {
    # Recent proposals
  }
}
```

## Error Handling

### Common Errors and Solutions

#### 1. Entity Not Found
```typescript
if (!data.entity) {
  // Entity doesn't exist on this chain
  // Try other chains or handle gracefully
}
```

#### 2. Query Complexity
If query is too complex:
- Reduce nested depth
- Fetch in multiple queries
- Reduce pagination size

#### 3. Rate Limiting
```typescript
const retryWithBackoff = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
}
```

## Variable Type Reference

Common GraphQL variable types:
- `String!` - Required string (addresses, IDs)
- `Int!` - Required integer (pagination)
- `BigInt!` - Large numbers (timestamps, amounts)
- `Boolean` - True/false
- `[String!]` - Array of strings
- `Entity_filter` - Filter input type
- `Entity_orderBy` - Sort field enum
- `OrderDirection` - "asc" or "desc"

## Query Validation Checklist

Before executing a query:
- [ ] All addresses are lowercase
- [ ] Variables match schema types
- [ ] Pagination limits are reasonable (≤100)
- [ ] Nested queries have depth limits
- [ ] Filter syntax is correct
- [ ] OrderBy field exists on entity
- [ ] Required variables are provided