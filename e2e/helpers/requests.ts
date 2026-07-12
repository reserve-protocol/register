export type BoundaryRequest =
  | {
      boundary: 'api'
      method: string
      pathname: string
      search: Record<string, string>
    }
  | {
      boundary: 'subgraph'
      operationName: string
      variables: Record<string, unknown>
      // Chain of the Goldsky host the request actually hit (from the
      // dtf-index-<chain> / dtf-yield-<chain> URL). Lets specs assert a
      // DTF-bearing query reached its registry chain's subgraph, catching the
      // app's mount-order wrong-chain-routing bug at the request boundary.
      urlChain: number
    }
  | {
      boundary: 'rpc'
      chainId: number
      method: string
      params: unknown[]
    }

