import { t } from '@lingui/macro'
import FacadeAct from 'abis/FacadeAct'
import { ExecuteButton } from 'components/button/TransactionButton'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Check } from 'react-feather'
import { chainIdAtom } from 'state/atoms'
import { FACADE_ACT_ADDRESS } from 'utils/addresses'
import { Address, Hex, encodeFunctionData } from 'viem'
import { auctionSessionAtom, auctionsToSettleAtom } from '../atoms'
import RevenueBoxContainer from './RevenueBoxContainer'

const settleTxAtom = atom((get) => {
  const auctionsToSettle = get(auctionsToSettleAtom)
  const chainId = get(chainIdAtom)

  if (!auctionsToSettle?.length) {
    return undefined
  }

  const traderToSettle = auctionsToSettle.reduce((acc, auction) => {
    acc[auction.trader] = [...(acc[auction.trader] || []), auction.sell.address]

    return acc
  }, {} as { [x: Address]: Address[] })

  const transactions = (Object.keys(traderToSettle) as Address[]).reduce(
    (auctions, trader) => {
      return [
        ...auctions,
        encodeFunctionData({
          abi: FacadeAct,
          functionName: 'runRevenueAuctions',
          args: [
            trader,
            traderToSettle[trader],
            [],
            new Array(traderToSettle[trader].length ?? 0).fill(0),
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

const SettleableAuctions = () => {
  const settleable = useAtomValue(auctionsToSettleAtom)
  const call = useAtomValue(settleTxAtom)
  const setSession = useSetAtom(auctionSessionAtom)

  const handleSuccess = () => {
    setSession(Math.random())
  }

  return (
    <RevenueBoxContainer
      title={t`Settleable auctions`}
      icon={<Check size={24} />}
      loading={!settleable}
      subtitle={t`${settleable?.length ?? 0} auctions`}
      mb={3}
      right={
        <ExecuteButton
          text={t`Settle all`}
          small
          ml="auto"
          successLabel="Success!"
          call={call}
          onSuccess={handleSuccess}
        />
      }
    />
  )
}

export default SettleableAuctions
