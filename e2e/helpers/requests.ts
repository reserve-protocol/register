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
    }
  | {
      boundary: 'rpc'
      chainId: number
      method: string
      params: unknown[]
    }

