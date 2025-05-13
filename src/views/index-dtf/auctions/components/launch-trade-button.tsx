import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import {
  AssetTrade,
  dtfTradeMapAtom,
  isAuctionLauncherAtom,
  TRADE_STATE,
} from '../atoms'
import useAuctionLimits from '../hooks/useAuctionLimits'
import AuctionEjectSwitch from './auction-eject-switch'
import TradeButtonStates from './trade-button-states'

// Updates the trade state!
export const updateTradeStateAtom = atom(null, (get, set, tradeId: string) => {
  const dtf = get(indexDTFAtom)
  const tradeMap = get(dtfTradeMapAtom)

  // Edge case if we are here, these exists
  if (!tradeMap || !dtf) return

  const currentTime = getCurrentTime()

  set(dtfTradeMapAtom, {
    ...tradeMap,
    [tradeId]: {
      ...tradeMap[tradeId],
      state: TRADE_STATE.RUNNING,
      start: currentTime,
      end: currentTime + dtf.auctionLength,
    },
  })
})

const LaunchTradeButton = ({
  trade,
  className,
}: {
  trade: AssetTrade
  className?: string
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const isAuctionLauncher = useAtomValue(isAuctionLauncherAtom)
  const updateTradeState = useSetAtom(updateTradeStateAtom)
  const { writeContract, isError, isPending, data } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })
  const isLoading = isPending || (!!data && !isSuccess && !isError)
  const [ejectFully, setEjectFully] = useState(false)
  const auctionLimits = useAuctionLimits(trade, ejectFully)

  const canLaunch =
    trade.state === TRADE_STATE.AVAILABLE ||
    (isAuctionLauncher &&
      trade.state === TRADE_STATE.PENDING &&
      trade.availableRuns > 0 &&
      trade.boughtAmount < trade.buyLimitSpot &&
      auctionLimits)
  const isDisabled = isLoading || !canLaunch

  // TODO: Show sonnet
  useEffect(() => {
    if (isSuccess) {
      updateTradeState(trade.id)
    }
  }, [isSuccess])

  const handleLaunch = () => {
    if (getCurrentTime() >= trade.launchTimeout + 5) return

    // Trade id has the dtfId as prefix
    const [dtfAddress, tradeId] = trade.id.split('-')

    // Open trade
    if (isAuctionLauncher) {
      if (!auctionLimits) return

      const { sellLimit, buyLimit, startPrice, endPrice } = auctionLimits

      writeContract({
        address: dtfAddress as Address,
        abi: dtfIndexAbi,
        functionName: 'openAuction',
        args: [BigInt(tradeId), sellLimit, buyLimit, startPrice, endPrice],
      })
    } else {
      if (version === '1.0.0') {
        writeContract({
          address: dtfAddress as Address,
          abi: dtfIndexAbi,
          functionName: 'openAuctionPermissionlessly',
          args: [BigInt(tradeId)],
        })
      } else {
        writeContract({
          address: dtfAddress as Address,
          abi: dtfIndexAbiV2,
          functionName: 'openAuctionUnrestricted',
          args: [BigInt(tradeId)],
        })
      }
    }
  }

  if (
    trade.state !== TRADE_STATE.PENDING &&
    trade.state !== TRADE_STATE.AVAILABLE
  ) {
    return <TradeButtonStates trade={trade} className={className} />
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <AuctionEjectSwitch
        trade={trade}
        value={ejectFully}
        setValue={setEjectFully}
        disabled={isDisabled}
      />
      <Button
        className={cn('sm:py-6 gap-1', className)}
        disabled={isDisabled}
        onClick={handleLaunch}
      >
        {isLoading ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            <span>Launching...</span>
          </>
        ) : (
          'Launch'
        )}
      </Button>
    </div>
  )
}

export default LaunchTradeButton
