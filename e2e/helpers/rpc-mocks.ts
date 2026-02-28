import type { Page } from '@playwright/test'

// All RPC provider URL patterns used in src/state/chain/index.tsx
// NOTE: patterns use **domain** (not **/domain/**) to match URLs with or without paths.
// e.g. https://base-rpc.publicnode.com has no path, so **/publicnode.com/** would miss it.
const RPC_PATTERNS = [
  '**publicnode.com**',
  '**tenderly.co**',
  '**infura.io**',
  '**alchemyapi.io**',
  '**alchemy.com**',
  '**ankr.com**',
  '**binance.org**',
  '**ninicoin.io**',
  '**defibit.io**',
  '**llamarpc.com**',
]

interface RpcRequest {
  jsonrpc: string
  id: number
  method: string
  params?: unknown[]
}

// Multicall3 deployed at same address on all chains
const MULTICALL3 = '0xca11bde05977b3631167028862be2a173976ca11'

// getVotes(address,uint256) selector — keccak256("getVotes(address,uint256)")
const GET_VOTES_SELECTOR = 'eb9019d4'

// 100,000 * 10^18 — enough voting power to pass propose threshold
// 100,000 / 2,500,000 supply = 4% > 1% threshold for all governance types
const VOTING_POWER_HEX = (BigInt(100_000) * 10n ** 18n)
  .toString(16)
  .padStart(64, '0')

// Mock tx hash returned by the wallet mock (eth_sendTransaction)
const MOCK_TX_HASH = '0x' + 'a'.repeat(64)

// Valid receipt for confirmed transactions.
// blockNumber is 3 below eth_blockNumber (0x1000000) to satisfy wagmi's
// 3-confirmation requirement on Base chain.
const VALID_RECEIPT = {
  blockHash: '0x' + '1'.repeat(64),
  blockNumber: '0xfffffd',
  contractAddress: null,
  cumulativeGasUsed: '0x5208',
  effectiveGasPrice: '0x3B9ACA00',
  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  gasUsed: '0x5208',
  logs: [],
  logsBloom: '0x' + '0'.repeat(512),
  status: '0x1',
  to: '0x0000000000000000000000000000000000000000',
  transactionHash: MOCK_TX_HASH,
  transactionIndex: '0x0',
  type: '0x2',
}

/**
 * Parse aggregate3 calldata to extract individual (target, callData) pairs.
 * aggregate3 input: Call[] where Call = (address target, bool allowFailure, bytes callData)
 */
function parseAggregate3Calls(
  calldata: string
): { target: string; data: string }[] {
  // Strip 0x prefix and selector (10 chars total)
  const hex = calldata.slice(10)
  const readWord = (pos: number) => hex.slice(pos * 64, (pos + 1) * 64)
  const readInt = (pos: number) => parseInt(readWord(pos), 16)

  // word 0: offset to Call[] array — always 0x20
  // word 1: array length
  const numCalls = readInt(1)
  const calls: { target: string; data: string }[] = []

  for (let i = 0; i < numCalls; i++) {
    // word (2 + i): offset to Call[i] relative to tail section start (word 2)
    const callOffset = readInt(2 + i) / 32 + 2 // tail starts at word 2

    // Call tuple: (address target, bool allowFailure, bytes callData)
    const targetWord = readWord(callOffset)
    const target = '0x' + targetWord.slice(24) // last 20 bytes

    // Calldata offset is relative to start of this tuple
    const calldataRelOffset = readInt(callOffset + 2)
    const calldataWordStart = callOffset + calldataRelOffset / 32
    const calldataLen = readInt(calldataWordStart) // bytes length
    // Read the raw calldata bytes
    const calldataHexStart = (calldataWordStart + 1) * 64
    const calldataHex = hex.slice(
      calldataHexStart,
      calldataHexStart + calldataLen * 2
    )

    calls.push({ target, data: '0x' + calldataHex })
  }

  return calls
}

const word = (val: string | number) =>
  typeof val === 'string'
    ? val.padStart(64, '0')
    : val.toString(16).padStart(64, '0')

/**
 * Build a properly encoded aggregate3 response.
 * Dispatches each inner call to handleSingleEthCall and encodes individual
 * return data, so each call gets its own correct response.
 */
function buildMulticall3Response(calldata: string): string {
  let calls: { target: string; data: string }[]
  try {
    calls = parseAggregate3Calls(calldata)
  } catch (e) {
    console.error('[multicall] parse error:', e)
    calls = []
  }

  const results: string[] = [] // raw hex returnData per call (without 0x prefix)

  for (const call of calls) {
    const result = handleSingleEthCall(call.target, call.data)
    // Strip 0x prefix if present
    const resultHex =
      typeof result === 'string' && result.startsWith('0x')
        ? result.slice(2)
        : typeof result === 'string'
          ? result
          : '0'.repeat(64)
    results.push(resultHex)
  }

  // Encode Result[] where Result = (bool success, bytes returnData)
  let hex = ''
  hex += word(0x20) // offset to Result[]
  hex += word(calls.length) // array length

  // Calculate element offsets (relative to start of array data = after length word)
  // Each element is a dynamic tuple, so we need offsets
  // First: all N offset words, then the element data
  let dataOffset = calls.length * 32 // bytes after all offset words
  const elementOffsets: number[] = []
  const elementDatas: string[] = []

  for (let i = 0; i < calls.length; i++) {
    elementOffsets.push(dataOffset)

    // Element: bool success(32) + offset to bytes(32) + bytes(length word + padded data)
    const resultHex = results[i]
    const resultBytes = resultHex.length / 2
    const paddedWords = Math.ceil(resultBytes / 32) || 1

    let elem = ''
    elem += word(1) // success = true
    elem += word(0x40) // offset to bytes = 2 words from tuple start
    elem += word(resultBytes) // bytes length
    // Pad result data to 32-byte boundary
    elem += resultHex.padEnd(paddedWords * 64, '0')

    elementDatas.push(elem)
    dataOffset += (3 + paddedWords) * 32 // 3 header words + data words
  }

  // Write offsets
  for (const offset of elementOffsets) {
    hex += word(offset)
  }
  // Write element data
  for (const data of elementDatas) {
    hex += data
  }

  return '0x' + hex
}

/**
 * Handle a single eth_call (not multicall).
 * Used both directly and as dispatch target for inner multicall calls.
 */
function handleSingleEthCall(
  to: string | undefined,
  data: string
): string {
  const addr = to?.toLowerCase() ?? ''

  // Direct getVotes call — return voting power
  if (data.startsWith('0x' + GET_VOTES_SELECTOR)) {
    return '0x' + VOTING_POWER_HEX
  }

  // Nested multicall (shouldn't happen normally but handle gracefully)
  if (addr === MULTICALL3 && data.startsWith('0x82ad56cb')) {
    return buildMulticall3Response(data)
  }

  // Default: return 3 zero uint256s (96 bytes covers most return types)
  return '0x' + '0'.repeat(192)
}

export function handleRpcMethod(method: string, params?: unknown[]): unknown {
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

    case 'eth_call': {
      const callParams = params?.[0] as
        | { to?: string; data?: string }
        | undefined
      const to = callParams?.to?.toLowerCase()
      const data = callParams?.data ?? ''

      // Multicall3 aggregate3 — decode inner calls and dispatch individually
      if (to === MULTICALL3 && data.startsWith('0x82ad56cb')) {
        return buildMulticall3Response(data)
      }

      // Single eth_call — dispatch to shared handler
      return handleSingleEthCall(to, data)
    }

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
      // Return valid receipt so useWaitForTransactionReceipt resolves
      return VALID_RECEIPT

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
            buildRpcResponse(req.id, handleRpcMethod(req.method, req.params))
          )
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(responses),
          })
        }

        // Single request
        const result = handleRpcMethod(body.method, body.params)
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildRpcResponse(body.id, result)),
        })
      } catch (err) {
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
