import BackingManager from 'abis/BackingManager'
import FacadeAct from 'abis/FacadeAct'
import useContractWrite from 'hooks/useContractWrite'
import { atom, useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { FACADE_ACT_ADDRESS } from 'utils/addresses'
import { Address, Hex, encodeFunctionData } from 'viem'
import {
  auctionPlatformAtom,
  auctionsOverviewAtom,
  auctionsToSettleAtom,
  selectedAuctionsAtom,
} from '../atoms'
import { UseSimulateContractParameters } from 'wagmi'

export enum TradeKind {
  DUTCH_AUCTION,
  BATCH_AUCTION,
}

const auctionsTxAtom = atom((get): UseSimulateContractParameters => {
  const { availableAuctions: revenue = [], recollaterization } =
    get(auctionsOverviewAtom) || {}
  const chainId = get(chainIdAtom)
  const selectedAuctions = get(selectedAuctionsAtom)
  const auctionsToSettle = get(auctionsToSettleAtom) || []
  const kind = get(auctionPlatformAtom)

  const traderToSettle = auctionsToSettle.reduce(
    (acc, auction) => {
      acc[auction.trader] = [
        ...(acc[auction.trader] || []),
        auction.sell.address,
      ]

      return acc
    },
    {} as { [x: Address]: Address[] }
  )

  if (recollaterization && !Object.keys(traderToSettle).length) {
    return {
      address: recollaterization.trader,
      functionName: 'rebalance',
      abi: BackingManager,
      args: [kind],
    }
  }

  const traderAuctions = selectedAuctions.reduce(
    (auctions, selectedIndex) => {
      if (revenue[selectedIndex]?.canStart) {
        auctions[revenue[selectedIndex].trader] = [
          ...(auctions[revenue[selectedIndex].trader] || []),
          revenue[selectedIndex].sell.address,
        ]
      }

      return auctions
    },
    {} as { [x: Address]: Address[] }
  )

  const traders = new Set([
    ...Object.keys(traderAuctions),
    ...Object.keys(traderToSettle),
  ])

  const transactions = ([...traders] as Address[]).reduce(
    (auctions, trader) => {
      return [
        ...auctions,
        encodeFunctionData({
          abi: FacadeAct,
          functionName: 'runRevenueAuctions',
          args: [
            trader,
            traderToSettle[trader] || [],
            traderAuctions[trader] || [],
            new Array(traderAuctions[trader]?.length ?? 0).fill(kind),
          ],
        }),
      ]
    },
    [] as Hex[]
  )

  return {
    abi: FacadeAct,
    address: FACADE_ACT_ADDRESS[chainId],
    args: [transactions],
    functionName: 'multicall',
    query: { enabled: !!transactions.length },
  }
})

const useAuctions = () => {
  const tx = useAtomValue(auctionsTxAtom)

  return useContractWrite(tx)
}

export default useAuctions
