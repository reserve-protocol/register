import dtfIndexAbi from '@/abis/dtf-index-abi'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAssetPrices } from '@/hooks/useAssetPrices'
import useTokensInfo from '@/hooks/useTokensInfo'
import { getBasketPortion } from '@/lib/index-rebalance/utils'
import { cn } from '@/lib/utils'
import { formatPercentage } from '@/utils'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon, ChevronsUpDown } from 'lucide-react'
import { useMemo } from 'react'
import { collapseAllNested, defaultStyles } from 'react-json-view-lite'
import { JsonView } from 'react-json-view-lite'
import { Link } from 'react-router-dom'
import { Address, decodeFunctionData, Hex } from 'viem'

type Trade = {
  sell: Address
  buy: Address
  sellLimit: {
    spot: bigint
    low: bigint
    high: bigint
  }
  buyLimit: {
    spot: bigint
    low: bigint
    high: bigint
  }
  prices: {
    start: bigint
    end: bigint
  }
  ttl: bigint
}

interface BasketProposalPreviewProps {
  calldatas: Hex[] | undefined
  address: Address | undefined
  basket: Token[] | undefined
  shares: Record<string, string>
  prices: Record<string, number>
}

const useDecodedTrades = (calldatas: Hex[] | undefined): Trade[] => {
  return useMemo(() => {
    if (!calldatas) return []

    return calldatas.map((calldata) => {
      const { args } = decodeFunctionData({
        abi: dtfIndexAbi,
        data: calldata,
      })

      const [sell, buy, sellLimit, buyLimit, prices, ttl] = args

      return {
        sell: sell as Address,
        buy: buy as Address,
        sellLimit: sellLimit as {
          spot: bigint
          low: bigint
          high: bigint
        },
        buyLimit: buyLimit as {
          spot: bigint
          low: bigint
          high: bigint
        },
        prices: prices as {
          start: bigint
          end: bigint
        },
        ttl: ttl as bigint,
      }
    })
  }, [calldatas])
}

const TABS = {
  BASKET: 'basket',
  TRADES: 'trades',
  RAW: 'raw',
}

const Header = ({ address }: { address: Address }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="mx-4 py-4 flex items-center flex-wrap gap-2 border-b">
      <h1 className="text-xl font-bold text-primary">Folio</h1>
      <Link
        target="_blank"
        className="mr-auto"
        to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
      >
        <Button
          size="icon-rounded"
          className="bg-primary/10 text-primary h-6 w-6 p-0 hover:text-white"
        >
          <ArrowUpRightIcon size={18} strokeWidth={1.5} />
        </Button>
      </Link>

      <TabsList className="h-9">
        <TabsTrigger value={TABS.BASKET} className="w-max h-7">
          Summary
        </TabsTrigger>
        <TabsTrigger value={TABS.TRADES} className="w-max h-7">
          Trades
        </TabsTrigger>
        <TabsTrigger value={TABS.RAW} className="w-max h-7">
          Raw
        </TabsTrigger>
      </TabsList>
    </div>
  )
}

const BasketPreview = ({ basket }: { basket: EstimatedBasket | undefined }) => {
  const chainId = useAtomValue(chainIdAtom)

  if (!basket) return <Skeleton className="h-[200px]" />

  return (
    <div className="rounded-3xl bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border-r">Token</TableHead>
            <TableHead className="w-24 text-center">Current</TableHead>
            <TableHead className="bg-primary/10 text-primary text-center font-bold w-24">
              Expected
            </TableHead>
            <TableHead className="w-24 text-center">Delta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(basket).map(([address, asset]) => (
            <TableRow key={address}>
              <TableCell className="border-r">
                <div className="flex items-center gap-2">
                  <TokenLogo
                    size="xl"
                    address={asset.token.address}
                    chain={chainId}
                  />
                  <div className="mr-auto">
                    <h4 className="font-bold mb-1">{asset.token.symbol}</h4>
                    <p className="text-sm text-legend">
                      {shortenAddress(asset.token.address)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center ">
                {asset.currentShares}%
              </TableCell>
              <TableCell className="text-center bg-primary/10 text-primary font-bold">
                {asset.targetShares}%
              </TableCell>
              <TableCell
                className={cn('text-center', {
                  'text-green-500': asset.delta > 0,
                  'text-red-500': asset.delta < 0,
                  'text-gray-500': asset.delta === 0,
                })}
              >
                {asset.delta > 0 && '+'}
                {formatPercentage(asset.delta)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const ProposedTradeItem = ({
  trade,
  className,
}: {
  trade: ProposedTradeWithMeta
  className?: string
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div
      className={cn('flex flex-wrap gap-2 items-center py-4 pl-2', className)}
    >
      <TokenLogo chain={chainId} address={trade.token.address} />
      <div className="mr-auto text-primary">
        <span>Buy {trade.token.symbol}</span>
        <h4 className="text-xl font-bold">+{formatPercentage(trade.shares)}</h4>
      </div>
      {/* <ProposedTradeVolatility index={trade.index} /> */}
    </div>
  )
}

const ProposedTradeSold = ({
  sell,
  multiple,
}: {
  sell: SellData
  multiple: boolean
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 rounded-xl bg-destructive/10 text-destructive p-4',
        !multiple ? 'items-center' : undefined
      )}
    >
      <div className={multiple ? 'w-52' : undefined}>
        <TokenLogo chain={chainId} address={sell.token?.address} size="lg" />
      </div>
      <div className="flex flex-col justify-end flex-grow">
        <h3 className="text-sm">Sell ${sell.token.symbol}</h3>
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-bold mr-auto">
            {formatPercentage(Number(sell.shares) - sell.percent).replace(
              '-',
              ''
            )}
          </h4>
          <span className="text-sm text-right">
            From {formatPercentage(Number(sell.shares))} to{' '}
            {formatPercentage(sell.percent)}
          </span>
        </div>
      </div>
    </div>
  )
}

const Row = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn('grid grid-cols-[248px_auto] gap-2', className)}>
      {children}
    </div>
  )
}

const ProposedTradeGroup = ({ group }: { group: IProposedTradeGroup }) => (
  <Row className="p-2">
    <ProposedTradeSold sell={group.sell} multiple={group.trades.length > 1} />
    <div className="flex flex-col">
      {group.trades.map((trade, index) => (
        <ProposedTradeItem
          key={index}
          trade={trade}
          className={index ? 'border-t' : undefined}
        />
      ))}
    </div>
  </Row>
)

const TradesPreview = ({ trades }: { trades: OrganizedTrades | undefined }) => {
  if (!trades) return <Skeleton className="h-[200px]" />

  return (
    <div className="flex flex-col gap-2">
      <Row>
        <div className="p-4 text-legend">Selling</div>
        <div className="flex items-center gap-2 flex-wrap p-4 flex-grow border-b text-legend">
          <span className="mr-auto">Buying</span>
          <span>Expected volatility</span>
        </div>
      </Row>
      {Object.keys(trades).map((key) => (
        <ProposedTradeGroup key={key} group={trades[key]} />
      ))}
    </div>
  )
}

// TODO: Get signature and params from calldata
const RawPreview = ({
  trades,
  calldatas,
}: {
  trades: Trade[]
  calldatas: Hex[] | undefined
}) => {
  if (!calldatas) return <Skeleton className="h-24 rounded-3xl" />

  const totalTrades = trades.length

  return (
    <div className="p-4 flex flex-col gap-2">
      {trades.map((trade, i) => (
        <div className="flex flex-col gap-2" key={i.toString()}>
          <h4 className="text-primary text-lg font-semibold">
            {i + 1}/{totalTrades}
          </h4>
          <div>
            <span className="text-legend text-sm block mb-1">Signature</span>
            <span className="font-semibold">
              approveTrade(sell: address, buy: address, sellLimit: IFolio.Range,
              buyLimit: IFolio.Range, prices: IFolio.Range, ttl: uint256)
            </span>
          </div>
          <div>
            <span className="text-legend text-sm block mb-1">Parameters</span>
            <JsonView
              shouldExpandNode={collapseAllNested}
              style={defaultStyles}
              data={trade}
            />
          </div>
          <div>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center w-full border-b py-4 transition-colors hover:border-primary hover:text-primary">
                <span className="font-semibold mr-auto">Executable code</span>
                <ChevronsUpDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-2 bg-foreground/5 rounded-3xl">
                <code className="w-full  text-wrap break-all">
                  {calldatas[i]}
                </code>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      ))}
    </div>
  )
}

type EstimatedBasketAsset = {
  token: Token
  currentShares: string
  targetShares: string
  delta: number
}

type EstimatedBasket = Record<string, EstimatedBasketAsset>

// TODO: Duplicated types
type ProposedTradeWithMeta = Trade & {
  index: number
  token: Token
  shares: number
}

type SellData = {
  token: Token
  amount: bigint
  percent: number
  shares: string
}

type IProposedTradeGroup = {
  sell: SellData
  trades: ProposedTradeWithMeta[]
}

type OrganizedTrades = Record<string, IProposedTradeGroup>

// Get:
// - current-> target basket with deltas
// - Organized trades by sell token
const useBasketProposalContext = (
  dtf: Address | undefined,
  basket: Token[] | undefined,
  shares: Record<string, string>,
  prices: Record<string, number>,
  trades: Trade[]
) => {
  const missingTokens = useMemo(() => {
    if (!basket || trades.length === 0 || Object.keys(shares).length === 0)
      return undefined

    const currentTokens = new Set(Object.keys(shares))
    const missingTokenSet = new Set<string>()

    trades.forEach((trade) => {
      if (!currentTokens.has(trade.sell.toLowerCase())) {
        missingTokenSet.add(trade.sell.toLowerCase())
      }
      if (!currentTokens.has(trade.buy.toLowerCase())) {
        missingTokenSet.add(trade.buy.toLowerCase())
      }
    })

    return [...missingTokenSet]
  }, [basket, trades, shares])
  const isThereMissingTokens = missingTokens && missingTokens.length > 0
  const { data: newPrices } = useAssetPrices(missingTokens ?? [])
  const { data: newTokensInfo } = useTokensInfo(missingTokens ?? [])

  return useMemo(() => {
    if (
      (isThereMissingTokens && (!newPrices || !newTokensInfo)) ||
      !dtf ||
      !basket
    )
      return undefined

    const allPrices = {
      ...prices,
      ...(newPrices?.reduce(
        (acc, price) => {
          acc[price.address.toLowerCase()] = price.price ?? 0
          return acc
        },
        {} as Record<string, number>
      ) ?? {}),
    }
    const allTokens = {
      ...basket.reduce(
        (acc, token) => {
          acc[token.address] = token
          return acc
        },
        {} as Record<string, Token>
      ),
      ...newTokensInfo,
    }
    const dtfPrice = allPrices[dtf?.toLowerCase() ?? ''] ?? 0
    // Create initial estimated basket
    const estimatedBasket = Object.entries(allTokens).reduce(
      (acc, [address, token]) => {
        acc[address] = {
          token,
          currentShares: shares[address] ?? '0',
          targetShares: shares[address] ?? '0',
          delta: 0,
        }
        return acc
      },
      {} as EstimatedBasket
    )

    // Track already substracted tokens "up to" shares
    const substractedMap = new Set<string>()

    // Create organized trades by sell token
    // Group trades by sell token
    const organizedTrades = trades.reduce((acc, trade, index) => {
      const sellAddress = trade.sell.toLowerCase()
      const buyAddress = trade.buy.toLowerCase()

      if (!acc[sellAddress]) {
        acc[sellAddress] = {
          trades: [],
          sell: {
            token: estimatedBasket[sellAddress].token,
            amount: 0n,
            percent: 0,
            shares: estimatedBasket[sellAddress].currentShares,
          },
        }
      }

      const sellTokenShares =
        getBasketPortion(
          trade.sellLimit.spot,
          BigInt(estimatedBasket[sellAddress].token.decimals),
          allPrices[sellAddress],
          dtfPrice
        )[0] * 100
      const buyTokenShares =
        getBasketPortion(
          trade.buyLimit.spot,
          BigInt(estimatedBasket[buyAddress].token.decimals),
          allPrices[buyAddress],
          dtfPrice
        )[0] * 100

      acc[sellAddress].trades.push({
        ...trade,
        index,
        token: estimatedBasket[buyAddress].token,
        shares:
          buyTokenShares - Number(estimatedBasket[buyAddress].currentShares),
      })
      acc[sellAddress].sell.amount += trade.sellLimit.spot
      acc[sellAddress].sell.percent = sellTokenShares

      if (!substractedMap.has(sellAddress)) {
        estimatedBasket[sellAddress].targetShares = sellTokenShares.toFixed(2)
        estimatedBasket[sellAddress].delta =
          Number(estimatedBasket[sellAddress].targetShares) -
          Number(estimatedBasket[sellAddress].currentShares)
        substractedMap.add(sellAddress)
      }

      if (!substractedMap.has(buyAddress)) {
        estimatedBasket[buyAddress].targetShares = buyTokenShares.toFixed(2)
        estimatedBasket[buyAddress].delta =
          Number(estimatedBasket[buyAddress].targetShares) -
          Number(estimatedBasket[buyAddress].currentShares)
        substractedMap.add(buyAddress)
      }

      return acc
    }, {} as OrganizedTrades)

    return [estimatedBasket, organizedTrades] as [
      EstimatedBasket,
      OrganizedTrades,
    ]
  }, [
    newPrices,
    newTokensInfo,
    dtf,
    basket,
    shares,
    prices,
    isThereMissingTokens,
  ])
}

const BasketProposalPreview = ({
  calldatas,
  basket,
  shares,
  prices,
  address,
}: BasketProposalPreviewProps) => {
  const trades = useDecodedTrades(calldatas)
  const basketProposalContext = useBasketProposalContext(
    address,
    basket,
    shares,
    prices,
    trades
  )

  return (
    <Tabs
      defaultValue="basket"
      className="flex flex-col gap-4 p-2 pt-4 rounded-3xl bg-background"
    >
      <Header address={address ?? '0x'} />
      <TabsContent className="m-0" value={TABS.BASKET}>
        <BasketPreview basket={basketProposalContext?.[0]} />
      </TabsContent>
      <TabsContent className="m-0" value={TABS.TRADES}>
        <TradesPreview trades={basketProposalContext?.[1]} />
      </TabsContent>
      <TabsContent className="m-0" value={TABS.RAW}>
        <RawPreview trades={trades} calldatas={calldatas} />
      </TabsContent>
    </Tabs>
  )
}

export default BasketProposalPreview
