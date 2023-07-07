import { t } from '@lingui/macro'
import { FacadeActInterface } from 'abis'
import { BigNumber } from 'ethers'
import useTransactionCost from 'hooks/useTransactionCost'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { addTransactionAtom, getValidWeb3Atom } from 'state/atoms'
import { useTransactionState } from 'state/chain/hooks/useTransactions'
import { TransactionState } from 'types'
import { getTransactionWithGasLimit } from 'utils'
import { FACADE_ACT_ADDRESS } from 'utils/addresses'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import {
  auctionsOverviewAtom,
  auctionsToSettleAtom,
  selectedAuctionsAtom,
} from '../atoms'

export enum TradeKind {
  DUTCH_AUCTION,
  BATCH_AUCTION,
}

// TODO: Add `kind` for 3.0
const auctionsTxAtom = atom((get) => {
  const { revenue = [], recollaterization } = get(auctionsOverviewAtom) || {}
  const { chainId } = get(getValidWeb3Atom)
  const selectedAuctions = get(selectedAuctionsAtom)
  const auctionsToSettle = get(auctionsToSettleAtom) || []

  if (!chainId) {
    return null
  }

  if (recollaterization) {
    return {
      id: '',
      description: t`Recollaterization`,
      status: TRANSACTION_STATUS.PENDING,
      value: recollaterization.amount,
      call: {
        abi: 'backingManager',
        address: recollaterization.trader,
        args: [],
        method: 'rebalance',
      },
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
  }, {} as { [x: string]: string[] })

  const traderToSettle = auctionsToSettle.reduce((acc, auction) => {
    acc[auction.trader] = [...(acc[auction.trader] || []), auction.sell.address]

    return acc
  }, {} as { [x: string]: string[] })

  const traders = new Set([
    ...Object.keys(traderAuctions),
    ...Object.keys(traderToSettle),
  ])

  const transactions = [...traders].reduce((auctions, trader) => {
    return [
      ...auctions,
      FacadeActInterface.encodeFunctionData('runRevenueAuctions', [
        trader,
        traderToSettle[trader] || [],
        traderAuctions[trader] || [],
        [
          BigNumber.from(TradeKind.BATCH_AUCTION.toString()),
          BigNumber.from(TradeKind.BATCH_AUCTION.toString()),
        ],
      ]),
    ]
  }, [] as string[])

  if (!transactions.length) {
    return null
  }

  return {
    id: '',
    description: t`Revenue auctions`,
    status: TRANSACTION_STATUS.PENDING,
    value: '0',
    call: {
      abi: 'facadeAct',
      address: FACADE_ACT_ADDRESS[chainId],
      args: [transactions],
      method: 'multicall',
    },
  } as TransactionState
})

const useAuctions = () => {
  const tx = useAtomValue(auctionsTxAtom)
  const [fee, error, gasLimit] = useTransactionCost(tx ? [tx] : [])
  const addTransaction = useSetAtom(addTransactionAtom)
  const [txId, setId] = useState('')
  const { status } = useTransactionState(txId) || {}

  const handleExecute = useCallback(() => {
    if (tx) {
      const id = uuid()
      addTransaction([{ ...getTransactionWithGasLimit(tx, gasLimit), id }])
      setId(id)
    }
  }, [JSON.stringify(tx), gasLimit, addTransaction])

  return useMemo(
    () => ({ tx, fee, status, onExecute: handleExecute, error }),
    [handleExecute, status, error]
  )
}

export default useAuctions
