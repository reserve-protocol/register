import RevenueTrader from 'abis/RevenueTrader'
import { atom } from 'jotai'
import { rTokenContractsAtom } from 'state/atoms'
import { Trader } from 'types'
import { Address, Hex, encodeFunctionData } from 'viem'
import { auctionsOverviewAtom } from 'views/auctions/atoms'
import { ClaimEmissionMap, Claimable } from './types'

export const selectedEmissionsAtom = atom<Record<string, ClaimEmissionMap>>({})

const availableEmissionsMapAtom = atom((get) => {
  const data = get(auctionsOverviewAtom)
  const emissionsMap: Record<string, Claimable> = {}

  for (const claimable of data?.claimableEmissions ?? []) {
    emissionsMap[claimable.asset.token.address] = claimable
  }

  return emissionsMap
})

export const claimsByTraderAtom = atom((get) => {
  const data = get(availableEmissionsMapAtom)
  const selected = get(selectedEmissionsAtom)
  const rTokenContracts = get(rTokenContractsAtom)
  const claims: Record<
    string,
    { address: Address; callDatas: Hex[]; tokens: Address[]; total: number }
  > = {}

  if (!rTokenContracts) {
    return claims
  }

  for (const erc20 of Object.keys(selected)) {
    for (const trader of Object.keys(selected[erc20])) {
      if (selected[erc20][trader as Trader]) {
        if (!claims[trader]) {
          claims[trader] = {
            tokens: [],
            callDatas: [],
            total: 0,
            address: rTokenContracts[trader as Trader].address,
          }
        }

        claims[trader].tokens.push(erc20 as Address)
        claims[trader].callDatas.push(
          encodeFunctionData({
            abi: RevenueTrader,
            functionName: 'claimRewardsSingle',
            args: [erc20 as Address],
          })
        )
        claims[trader].total += data[erc20]?.amountUsd ?? 0
      }
    }
  }

  return claims
})
