import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import { getStartRebalance } from '@reserve-protocol/dtf-rebalance-lib'
import { StartRebalanceArgsPartial as StartRebalanceArgsPartialV4 } from '@reserve-protocol/dtf-rebalance-lib/dist/4.0.0/types'
import { buildIndexDtfStartRebalanceArgs } from '@reserve-protocol/react-sdk'
import { Address, encodeFunctionData, Hex } from 'viem'

export type StartRebalanceCalldataInput = {
  folioVersion: 4 | 5
  supply: bigint
  tokens: Address[]
  decimals: bigint[]
  balances: bigint[]
  // D18 shares per token, aligned with `tokens`.
  targetBasket: bigint[]
  prices: number[]
  priceErrors: number[]
  maxAuctionSizesUsd: number[]
  weightControl: boolean
  deferWeights: boolean
  auctionLauncherWindow: bigint
  ttl: bigint
}

// v5 args are SDK-owned; v4 stays on the Register-local library by decision.
export function buildStartRebalanceCalldata(
  input: StartRebalanceCalldataInput
): Hex {
  if (input.folioVersion === 5) {
    const args = buildIndexDtfStartRebalanceArgs({
      version: '5.0.0',
      tokens: input.tokens.map((address, i) => ({
        address,
        decimals: Number(input.decimals[i]),
        price: input.prices[i],
      })),
      supply: input.supply,
      balances: input.balances,
      basket: { type: 'shares', shares: input.targetBasket },
      priceErrors: input.priceErrors,
      maxAuctionSizesUsd: input.maxAuctionSizesUsd,
      weightControl: input.weightControl,
      deferWeights: input.deferWeights,
    })

    return encodeFunctionData({
      abi: dtfIndexAbiV5,
      functionName: 'startRebalance',
      args: [
        args.tokens as any,
        args.limits as any,
        input.auctionLauncherWindow,
        input.ttl,
      ],
    })
  }

  const argsV4 = getStartRebalance(
    4,
    input.supply,
    input.tokens,
    input.balances,
    input.decimals,
    input.targetBasket,
    input.prices,
    input.priceErrors,
    input.maxAuctionSizesUsd,
    input.weightControl,
    input.deferWeights
  ) as StartRebalanceArgsPartialV4

  return encodeFunctionData({
    abi: dtfIndexAbiV4,
    functionName: 'startRebalance',
    args: [
      input.tokens,
      argsV4.weights as any,
      argsV4.prices as any,
      argsV4.limits as any,
      input.auctionLauncherWindow,
      input.ttl,
    ],
  })
}
