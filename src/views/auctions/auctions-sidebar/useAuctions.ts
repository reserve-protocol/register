import { t } from '@lingui/macro'
import useTransactionCost from 'hooks/useTransactionCost'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { addTransactionAtom, getValidWeb3Atom } from 'state/atoms'
import { TransactionState } from 'types'
import { FACADE_ACT_ADDRESS } from 'utils/addresses'
import { TRANSACTION_STATUS } from 'utils/constants'
import { auctionsOverviewAtom, selectedAuctionsAtom } from '../atoms'

// TODO: Add `kind` for 3.0
const auctionsTxsAtom = atom((get) => {
  const { revenue = [], recollaterization } = get(auctionsOverviewAtom) || {}
  const { chainId } = get(getValidWeb3Atom)
  const selectedAuctions = get(selectedAuctionsAtom)

  if (!chainId) {
    return []
  }

  if (recollaterization) {
    return [
      {
        id: '',
        description: t`Recollaterization`,
        status: TRANSACTION_STATUS.PENDING,
        value: recollaterization.amount,
        call: {
          abi: 'trader',
          address: recollaterization.trader,
          args: [recollaterization.sell.address],
          method: 'manageToken',
        },
      },
    ]
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

  return Object.keys(traderAuctions).reduce((auctions, trader) => {
    return [
      ...auctions,
      {
        id: '',
        description: t`Trigger Revenue auction`,
        status: TRANSACTION_STATUS.PENDING,
        value: '0',
        call: {
          abi: 'facadeAct',
          address: FACADE_ACT_ADDRESS[chainId],
          args: [trader, [], traderAuctions[trader]],
          method: 'runRevenueAuctions',
        },
      },
    ]
  }, [] as TransactionState[])
})

const useAuctions = () => {
  const txs = useAtomValue(auctionsTxsAtom)
  const [fee, gasError, gasLimit] = useTransactionCost([])
  const addTransaction = useSetAtom(addTransactionAtom)

  const handleExecute = useCallback(() => {}, [
    txs.length,
    gasLimit,
    addTransaction,
  ])

  return useMemo(
    () => ({ txs, fee, onExecute: handleExecute }),
    [txs.length, fee, handleExecute]
  )
}

export default useAuctions
