import type { Page } from '@playwright/test'

// All RPC provider URL patterns used in src/state/chain/index.tsx
const RPC_PATTERNS = [
  '**/publicnode.com/**',
  '**/tenderly.co/**',
  '**/infura.io/**',
  '**/alchemyapi.io/**',
  '**/alchemy.com/**',
  '**/ankr.com/**',
  '**/binance.org/**',
  '**/ninicoin.io/**',
  '**/defibit.io/**',
  '**/llamarpc.com/**',
]

interface RpcRequest {
  jsonrpc: string
  id: number
  method: string
  params?: unknown[]
}

function handleRpcMethod(method: string): unknown {
  switch (method) {
    case 'eth_chainId':
      return '0x2105' // Base

    case 'eth_blockNumber':
      return '0x1000000'

    case 'net_version':
      return '8453'

    case 'eth_getBalance':
      return '0x0'

    case 'eth_gasPrice':
      return '0x3B9ACA00'

    case 'eth_estimateGas':
      return '0x5208'

    case 'eth_getCode':
      // Return non-empty bytecode so wagmi recognizes addresses as contracts
      return '0x6080604052'

    case 'eth_getTransactionCount':
      return '0x0'

    case 'eth_call':
      // Return empty bytes — most multicall/contract reads will get empty data
      return '0x'

    case 'eth_getBlockByNumber':
      return {
        number: '0x1000000',
        hash: '0x' + '0'.repeat(64),
        timestamp: '0x' + Math.floor(Date.now() / 1000).toString(16),
        transactions: [],
      }

    case 'eth_getLogs':
      return []

    case 'eth_getTransactionReceipt':
      return null

    default:
      return '0x'
  }
}

function buildRpcResponse(id: number, result: unknown) {
  return { jsonrpc: '2.0', id, result }
}

/**
 * Mock all RPC provider endpoints.
 * Handles both single requests and batched requests (wagmi multicall sends arrays).
 */
export async function mockRpcRoutes(page: Page) {
  for (const pattern of RPC_PATTERNS) {
    await page.route(pattern, async (route) => {
      const request = route.request()

      if (request.method() !== 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x' }),
        })
      }

      try {
        const body = request.postDataJSON()

        // Batched request (wagmi multicall)
        if (Array.isArray(body)) {
          const responses = body.map((req: RpcRequest) =>
            buildRpcResponse(req.id, handleRpcMethod(req.method))
          )
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(responses),
          })
        }

        // Single request
        const result = handleRpcMethod(body.method)
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildRpcResponse(body.id, result)),
        })
      } catch {
        // If we can't parse the body, return a generic response
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x' }),
        })
      }
    })
  }
}
