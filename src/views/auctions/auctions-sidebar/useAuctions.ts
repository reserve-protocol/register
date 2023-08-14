import BackingManager from 'abis/BackingManager'
import FacadeAct from 'abis/FacadeAct'
import useContractWrite from 'hooks/useContractWrite'
import { atom, useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { FACADE_ACT_ADDRESS } from 'utils/addresses'
import { Address, Hex, encodeFunctionData } from 'viem'
import {
  auctionsOverviewAtom,
  auctionsToSettleAtom,
  selectedAuctionsAtom,
} from '../atoms'
import { UsePrepareContractWriteConfig } from 'wagmi'

export enum TradeKind {
  DUTCH_AUCTION,
  BATCH_AUCTION,
}

// TODO: Add `kind` for 3.0
const auctionsTxAtom = atom((get): UsePrepareContractWriteConfig => {
  const { revenue = [], recollaterization } = get(auctionsOverviewAtom) || {}
  const chainId = get(chainIdAtom)
  const selectedAuctions = get(selectedAuctionsAtom)
  const auctionsToSettle = get(auctionsToSettleAtom) || []

  if (recollaterization) {
    return {
      address: recollaterization.trader,
      functionName: 'rebalance',
      abi: BackingManager,
    }
  }

  const traderAuctions = selectedAuctions.reduce((auctions, selectedIndex) => {
    if (revenue[selectedIndex]?.canStart) {
      auctions[revenue[selectedIndex].trader] = [
        ...(auctions[revenue[selectedIndex].trader] || []),
        revenue[selectedIndex].sell.address,
      ]
    }

    return auctions
  }, {} as { [x: Address]: Address[] })

  const traderToSettle = auctionsToSettle.reduce((acc, auction) => {
    acc[auction.trader] = [...(acc[auction.trader] || []), auction.sell.address]

    return acc
  }, {} as { [x: Address]: Address[] })

  const traders = new Set([
    ...Object.keys(traderAuctions),
    ...Object.keys(traderToSettle),
  ])

  const transactions = ([...traders] as Address[]).reduce(
    (auctions, trader) => {
      console.log('trades', [
        trader,
        traderToSettle[trader] || [],
        traderAuctions[trader] || [],
        [TradeKind.DUTCH_AUCTION, TradeKind.DUTCH_AUCTION],
      ])
      return [
        ...auctions,
        encodeFunctionData({
          abi: FacadeAct,
          functionName: 'runRevenueAuctions',
          args: [
            trader,
            traderToSettle[trader] || [],
            traderAuctions[trader] || [],
            [TradeKind.DUTCH_AUCTION],
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
    enabled: !!transactions.length,
  }
})

const useAuctions = () => {
  const tx = useAtomValue(auctionsTxAtom)

  return useContractWrite(tx)
}

export default useAuctions
