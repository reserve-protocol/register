import dtfIndexAbi from '@/abis/dtf-index-abi'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { openAuction } from '@/lib/index-rebalance/open-auction'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFPriceAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { formatPercentage, getCurrentTime } from '@/utils'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowRight, Check, LoaderCircle, X } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Address, erc20Abi, formatUnits, parseUnits } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  AssetTrade,
  dtfTradeMapAtom,
  dtfTradeVolatilityAtom,
  expectedBasketAtom,
  isAuctionLauncherAtom,
  proposedBasketAtom,
  setTradeVolatilityAtom,
  TRADE_STATE,
  VOLATILITY_OPTIONS,
  VOLATILITY_VALUES,
} from '../atoms'
import DecimalDisplay from '@/components/decimal-display'
import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'

const TradeCompletedStatus = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg text-primary border py-2 px-4',
        className
      )}
    >
      <Check size={16} />
      <span className="font-semibold">Traded</span>
    </div>
  )
}

const TradeOngoingStatus = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg text-primary border py-2 px-4',
        className
      )}
    >
      <LoaderCircle size={16} className="animate-spin" />
      <span className="font-semibold">Ongoing</span>
    </div>
  )
}

const TradeExpiredStatus = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg text-legend bg-muted py-2 px-4',
        className
      )}
    >
      <X size={16} />
      <span className="font-semibold">Expired</span>
    </div>
  )
}

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

const useProposalDtfSupply = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  const { data: supply } = useReadContract({
    address: indexDTF?.id,
    abi: erc20Abi,
    functionName: 'totalSupply',
    args: [],
    chainId,
    query: {
      enabled: !!indexDTF?.id && !!chainId,
    },
  })

  return supply
}

const TradeButton = ({
  trade,
  className,
}: {
  trade: AssetTrade
  className?: string
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const proposedBasket = useAtomValue(proposedBasketAtom)
  const expectedBasket = useAtomValue(expectedBasketAtom)
  const isAuctionLauncher = useAtomValue(isAuctionLauncherAtom)
  const updateTradeState = useSetAtom(updateTradeStateAtom)
  const { writeContract, isError, isPending, data } = useWriteContract()
  const tradeVolatility = useAtomValue(dtfTradeVolatilityAtom)
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })
  const dtfSupply = useProposalDtfSupply()
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const version = useAtomValue(indexDTFVersionAtom)

  const isLoading = isPending || (!!data && !isSuccess && !isError)

  const canLaunch =
    trade.state === TRADE_STATE.AVAILABLE ||
    (isAuctionLauncher &&
      trade.state === TRADE_STATE.PENDING &&
      trade.availableRuns > 1 &&
      trade.boughtAmount < trade.buyLimitSpot &&
      proposedBasket &&
      dtfSupply)

  // TODO: Show sonnet
  useEffect(() => {
    if (isSuccess) {
      updateTradeState(trade.id)
    }
  }, [isSuccess])

  const handleLaunch = () => {
    if (!dtfPrice || !canLaunch || getCurrentTime() >= trade.launchTimeout + 5)
      return

    // Trade id has the dtfId as prefix
    const [dtfAddress, tradeId] = trade.id.split('-')

    // Open trade
    if (isAuctionLauncher) {
      if (!proposedBasket || !dtfSupply) return

      // TODO: run helper to get estimates in case the price is deferred
      try {
        const volatility =
          VOLATILITY_VALUES[tradeVolatility[trade.id] || VOLATILITY_OPTIONS.LOW]
        const { tokens, decimals, targetBasket, prices, priceError } =
          Object.values(proposedBasket.basket).reduce(
            (acc, asset) => {
              acc.tokens.push(asset.token.address)
              acc.decimals.push(BigInt(asset.token.decimals))
              acc.targetBasket.push(parseUnits(asset.targetShares, 16))
              acc.prices.push(
                expectedBasket?.basket?.[asset.token.address]?.price ||
                  asset.price
              )
              acc.priceError.push(volatility)

              return acc
            },
            {
              tokens: [],
              decimals: [],
              targetBasket: [],
              prices: [],
              priceError: [],
            } as {
              tokens: Address[]
              decimals: bigint[]
              targetBasket: bigint[]
              prices: number[]
              priceError: number[]
            }
          )

        console.log('proposed basket', proposedBasket)
        console.log('expected basket', expectedBasket)
        // Log auction parameters for debugging
        console.log(
          'auction params',
          JSON.stringify(
            {
              auctionParams: {
                sell: trade.sell.address,
                buy: trade.buy.address,
                sellLimit: {
                  spot: trade.sellLimitSpot,
                  low: trade.sellLimitLow,
                  high: trade.sellLimitHigh,
                },
                buyLimit: {
                  spot: trade.buyLimitSpot,
                  low: trade.buyLimitLow,
                  high: trade.buyLimitHigh,
                },
                prices: {
                  start: trade.startPrice,
                  end: trade.endPrice,
                },
              },
              dtfSupply: dtfSupply.toString(),
              tokens,
              decimals: decimals.map((d) => d.toString()),
              targetBasket: targetBasket.map((tb) => tb.toString()),
              prices,
              priceError,
              dtfPrice: proposedBasket.price,
            },
            (_, value) => (typeof value === 'bigint' ? value.toString() : value)
          )
        )

        const [sellLimit, buyLimit, startPrice, endPrice] = openAuction(
          {
            sell: trade.sell.address,
            buy: trade.buy.address,
            sellLimit: {
              spot: trade.sellLimitSpot,
              low: trade.sellLimitLow,
              high: trade.sellLimitHigh,
            },
            buyLimit: {
              spot: trade.buyLimitSpot,
              low: trade.buyLimitLow,
              high: trade.buyLimitHigh,
            },
            prices: {
              start: trade.startPrice,
              end: trade.endPrice,
            },
          },
          {
            start: trade.approvedStartPrice,
            end: trade.approvedEndPrice,
          },
          dtfSupply,
          tokens,
          decimals,
          targetBasket,
          prices,
          priceError,
          proposedBasket.price
        )

        writeContract({
          address: dtfAddress as Address,
          abi: dtfIndexAbi,
          functionName: 'openAuction',
          args: [BigInt(tradeId), sellLimit, buyLimit, startPrice, endPrice],
        })
      } catch (e) {
        toast.error('Error opening auction')
        console.error('error running auction', e)
      }
    } else {
      if (version === '2.0.0') {
        writeContract({
          address: dtfAddress as Address,
          abi: dtfIndexAbiV2,
          functionName: 'openAuctionUnrestricted',
          args: [BigInt(tradeId)],
        })
      } else {
        writeContract({
          address: dtfAddress as Address,
          abi: dtfIndexAbi,
          functionName: 'openAuctionPermissionlessly',
          args: [BigInt(tradeId)],
        })
      }
    }
  }

  if (trade.state === TRADE_STATE.EXPIRED) {
    return <TradeExpiredStatus className={className} />
  }

  if (trade.state === TRADE_STATE.COMPLETED) {
    return <TradeCompletedStatus className={className} />
  }

  if (trade.state === TRADE_STATE.RUNNING) {
    return <TradeOngoingStatus className={className} />
  }

  if (trade.state === TRADE_STATE.COMPLETED) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 rounded-lg text-primary border py-2 px-4',
          className
        )}
      >
        <Check size={16} />
        <span className="font-semibold">Traded</span>
      </div>
    )
  }

  return (
    <Button
      className={cn('sm:py-6 gap-1', className)}
      disabled={isLoading || !canLaunch}
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
  )
}

const ProposedTradeVolatility = ({ tradeId }: { tradeId: string }) => {
  const setVolatility = useSetAtom(setTradeVolatilityAtom)
  const volatility = useAtomValue(dtfTradeVolatilityAtom)

  return (
    <div className="border rounded-xl p-0 sm:p-1">
      <ToggleGroup
        type="single"
        className="bg-muted-foreground/10 p-1 rounded-xl text-sm"
        value={volatility[tradeId] || VOLATILITY_OPTIONS.LOW}
        onValueChange={(value) => {
          setVolatility([tradeId, value])
        }}
      >
        {Object.values(VOLATILITY_OPTIONS).map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="px-1 sm:px-2 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

const Share = ({
  share,
  prefix,
}: {
  share: number | undefined
  prefix?: string
}) => {
  if (share === undefined) return <Skeleton className="h-8 w-14" />

  return (
    <h4 className="font-bold text-2xl">
      {prefix}
      {formatPercentage(share)}
    </h4>
  )
}

const ShareRange = ({
  from,
  to,
}: {
  from: number | undefined
  to: number | undefined
}) => {
  if (from == undefined || to === undefined)
    return <Skeleton className="h-8 w-14" />

  return (
    <span className="text-xs whitespace-nowrap">
      from {formatPercentage(from)} to {formatPercentage(to)}
    </span>
  )
}

const TradePreview = ({ trade }: { trade: AssetTrade }) => {
  const chainId = useAtomValue(chainIdAtom)
  const expectedBasket = useAtomValue(expectedBasketAtom)?.basket
  const isCompleted = trade.state === TRADE_STATE.COMPLETED

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center w-full sm:w-80 mr-auto">
      <div className="flex flex-col gap-1">
        <span>
          {isCompleted ? 'Sold' : 'Sell'} ${trade.sell.symbol}
        </span>
        <div className="flex items-center gap-1">
          <TokenLogo
            symbol={trade.sell.symbol}
            address={trade.sell.address}
            chain={chainId}
            size="lg"
          />
          {isCompleted ? (
            <DecimalDisplay
              value={formatUnits(trade.soldAmount, trade.sell.decimals)}
              decimals={1}
              compact
              className="font-bold text-2xl"
            />
          ) : (
            <Share share={expectedBasket?.[trade.sell.address]?.delta} />
          )}
        </div>
        {!isCompleted && (
          <ShareRange
            from={
              expectedBasket?.[trade.sell.address]?.currentShares
                ? Number(expectedBasket?.[trade.sell.address]?.currentShares)
                : undefined
            }
            to={
              expectedBasket?.[trade.sell.address]?.targetShares
                ? Number(expectedBasket?.[trade.sell.address]?.targetShares)
                : undefined
            }
          />
        )}
      </div>
      <div className="bg-muted rounded-full p-1 text-legend">
        <ArrowRight size={18} />
      </div>
      <div className="flex flex-col gap-1 items-end">
        <span>
          {isCompleted ? 'Bought' : 'Buy'} ${trade.buy.symbol}
        </span>
        <div className="flex items-center gap-1">
          {isCompleted ? (
            <DecimalDisplay
              value={formatUnits(trade.boughtAmount, trade.buy.decimals)}
              decimals={1}
              compact
              className="font-bold text-2xl"
            />
          ) : (
            <Share
              share={
                expectedBasket?.[trade.buy.address]?.delta !== undefined
                  ? Math.max(expectedBasket[trade.buy.address].delta, 0)
                  : undefined
              }
              prefix="+"
            />
          )}

          <TokenLogo
            symbol={trade.buy.symbol}
            address={trade.buy.address}
            chain={chainId}
            size="lg"
          />
        </div>
        {!isCompleted && (
          <ShareRange
            from={
              expectedBasket?.[trade.buy.address]?.currentShares
                ? Number(expectedBasket?.[trade.buy.address]?.currentShares)
                : undefined
            }
            to={
              expectedBasket?.[trade.buy.address]?.targetShares
                ? Number(expectedBasket?.[trade.buy.address]?.targetShares)
                : undefined
            }
          />
        )}
      </div>
    </div>
  )
}

// Display volatility options / hash / or nothing!
const AuctionContext = ({ trade }: { trade: AssetTrade }) => {
  const isAuctionLauncher = useAtomValue(isAuctionLauncherAtom)
  // Auction launcher state!
  // TODO: Currently no setting available
  // if (trade.state === TRADE_STATE.PENDING && isAuctionLauncher) {
  //   return <ProposedTradeVolatility tradeId={trade.id} />
  // }

  return null
}

const AuctionItem = ({ trade }: { trade: AssetTrade }) => (
  <>
    <div className="flex items-center gap-3 p-3 rounded-xl border">
      <div className="flex items-center flex-grow flex-wrap gap-2">
        <TradePreview trade={trade} />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <AuctionContext trade={trade} />
          <TradeButton className="ml-auto flex sm:hidden" trade={trade} />
        </div>
      </div>
      <TradeButton trade={trade} className="hidden sm:flex flex-shrink-0" />
    </div>
  </>
)

export default AuctionItem
