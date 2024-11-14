import ERC20 from 'abis/ERC20'
import { truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { collateralsMap } from 'utils/plugins'
import { formatEther, hexToString } from 'viem'
import { Address, readContracts, useBlockNumber, useQuery } from 'wagmi'
import { readContract } from 'wagmi/actions'

export type BasketItem = Record<
  string,
  { address: Address; share: number; targetUnit: string }
>

export type DiffItem = {
  address: string
  symbol: string
  status: 'added' | 'removed' | 'reduced' | 'increased' | 'unchanged'
  oldWeight: number
  newWeight: number
  targetUnit: string
}

export type PrimaryBasketRaw = [string[], bigint[]]

const getSnapshotBasket = async (
  rTokenAddress: Address,
  chainId: number,
  block: number
) => {
  const [erc20s, uoaShares, targets] = await readContract({
    abi: [
      {
        inputs: [
          { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
        ],
        name: 'basketBreakdown',
        outputs: [
          { internalType: 'address[]', name: 'erc20s', type: 'address[]' },
          { internalType: 'uint192[]', name: 'uoaShares', type: 'uint192[]' },
          { internalType: 'bytes32[]', name: 'targets', type: 'bytes32[]' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    functionName: 'basketBreakdown',
    address: FACADE_ADDRESS[chainId],
    args: [rTokenAddress],
    blockNumber: BigInt(block),
    chainId,
  })

  return erc20s.reduce((acc, current, index) => {
    return {
      ...acc,
      [current]: {
        address: current,
        share: truncateDecimals(+formatEther(uoaShares[index]) * 100, 4),
        targetUnit: hexToString(targets[index], { size: 32 }),
      },
    }
  }, {} as BasketItem)
}

const getTokensMeta = async (erc20s: Address[], chainId: number) => {
  const symbols = await readContracts({
    contracts: erc20s.map((erc20) => ({
      abi: ERC20,
      address: erc20,
      functionName: 'symbol',
      chainId,
    })),
    allowFailure: false,
  })

  return symbols.reduce((acc, symbol, index) => {
    return {
      ...acc,
      [erc20s[index]]: symbol,
    }
  }, {} as Record<string, string>)
}

const PRIORITY_ORDER = {
  added: 0,
  removed: 1,
  increased: 2,
  reduced: 3,
  unchanged: 4,
}

function basketDiff(
  current: BasketItem,
  proposed: BasketItem,
  symbols: Record<string, string>
): DiffItem[] {
  const diff: DiffItem[] = []

  // Check all addresses from both current and proposed
  const allAddresses = new Set([
    ...Object.keys(current),
    ...Object.keys(proposed),
  ])

  for (const address of allAddresses) {
    const oldWeight = current[address]?.share || 0
    const newWeight = proposed[address]?.share || 0

    let status: DiffItem['status']
    if (!current[address]) {
      status = 'added'
    } else if (!proposed[address]) {
      status = 'removed'
    } else if (oldWeight !== newWeight) {
      status = oldWeight > newWeight ? 'reduced' : 'increased'
    } else {
      status = 'unchanged'
    }

    diff.push({
      address,
      status,
      oldWeight,
      newWeight,
      targetUnit: current[address]?.targetUnit || proposed[address]?.targetUnit,
      symbol: symbols[address],
    })
  }

  diff.sort((a, b) => PRIORITY_ORDER[a.status] - PRIORITY_ORDER[b.status])

  return diff
}

export const useBasketChangesSummary = (
  proposal: PrimaryBasketRaw,
  rTokenAddress?: Address,
  chainId?: number,
  snapshotBlock?: number
) => {
  const { data: currentBlock } = useBlockNumber()
  const data = useQuery(
    ['basketDiff', !!currentBlock, proposal, rTokenAddress],
    async () => {
      if (!currentBlock || !rTokenAddress || !chainId) return undefined

      const snapshotBasket = await getSnapshotBasket(
        rTokenAddress,
        chainId,
        snapshotBlock || Number(currentBlock)
      )

      const proposalBasket = proposal[0].reduce((acc, current, index) => {
        return {
          ...acc,
          [current]: {
            address: current as Address,
            share: truncateDecimals(+formatEther(proposal[1][index]) * 100, 4),
            targetUnit: collateralsMap[chainId]?.[current]?.targetName || 'USD',
          },
        }
      }, {} as BasketItem)

      const tokensMeta = await getTokensMeta(
        [
          ...(Object.keys(snapshotBasket) as Address[]),
          ...(proposal[0] as Address[]),
        ],
        chainId
      )

      return {
        diff: basketDiff(snapshotBasket, proposalBasket, tokensMeta),
        snapshotBasket,
        proposalBasket,
        tokensMeta,
      }
    }
  )

  return data
}
