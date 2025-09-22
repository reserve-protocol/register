import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useScrollTo from '@/hooks/useScrollTo'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import {
  hasBridgedAssetsAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
} from '@/state/dtf/atoms'
import { getTokenName } from '@/utils'
import { ChainId } from '@/utils/chains'
import { capitalize } from '@/utils/constants'
import {
  ETHERSCAN_NAMES,
  ExplorerDataType,
  getExplorerLink,
} from '@/utils/getExplorerLink'
import { groupByNativeAsset } from '@/utils/token-mappings'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Copy, PackageOpen, Target } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import BridgeLabel from './bridge-label'

const MAX_TOKENS = 10

const BasketSkeleton = () =>
  Array.from({ length: 10 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-12 lg:w-[120px]" />
          <Skeleton className="h-3 w-8 lg:w-[80px]" />
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-4 w-[100px]" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-[60px] ml-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-4" />
      </TableCell>
    </TableRow>
  ))

// TODO: had an scrollarea but it looks kind of odd?
// TODO: above will be a problem for... 50-100 token baskets.. solve in the future!
const IndexBasketOverview = ({ className }: { className?: string }) => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const [viewAll, setViewAll] = useState(false)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const hasBridgedAssets = useAtomValue(hasBridgedAssetsAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isBSC = chainId === ChainId.BSC
  const [activeTab, setActiveTab] = useState(isBSC ? 'exposure' : 'collateral')
  const isExposure = activeTab === 'exposure'

  const scrollTo = useScrollTo('basket', 80)

  useEffect(() => {
    if (isBSC) {
      setActiveTab('exposure')
    } else {
      setActiveTab('collateral')
    }
  }, [isBSC])

  useEffect(() => {
    const section = window.location.hash.slice(1)
    if (section === 'basket' && basket?.length) {
      setTimeout(() => {
        scrollTo()
      }, 100)
    }
  }, [scrollTo, basket])

  const filtered = basket?.filter(
    (token) => basketShares[token.address] !== '0.00'
  )

  const exposureGroups = useMemo(() => {
    if (!filtered || !isExposure) return null

    const tokenData = filtered.map((token) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      weight: parseFloat(basketShares[token.address] || '0'),
    }))

    return groupByNativeAsset(tokenData, chainId)
  }, [filtered, basketShares, chainId, isExposure])

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('Copied to clipboard')
  }

  return (
    <div
      className={cn('relative -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-1', className)}
      id="basket"
    >
      <Tabs defaultValue="exposure">
        <Table>
          <TableHeader>
            <TableRow className="border-none text-legend bg-card sticky top-0 ">
              <TableHead className="text-left">
                {isBSC ? (
                  <TabsList className="h-9 rounded-[70px] p-0.5">
                    <TabsTrigger
                      value="exposure"
                      className="rounded-[60px] px-2 data-[state=active]:text-primary"
                      onClick={() => setActiveTab('exposure')}
                    >
                      <Target className="w-4 h-4 mr-1" /> Exposure
                    </TabsTrigger>
                    <TabsTrigger
                      value="collateral"
                      className="rounded-[60px] px-2 data-[state=active]:text-primary"
                      onClick={() => setActiveTab('collateral')}
                    >
                      <PackageOpen className="w-4 h-4 mr-1" /> Collateral
                    </TabsTrigger>
                  </TabsList>
                ) : (
                  'Token'
                )}
              </TableHead>
              <TableHead className="text-center">Weight</TableHead>
              <TableHead className={cn('text-right', isExposure && 'hidden')}>
                {`${hasBridgedAssets ? 'Bridge / ' : ''}${capitalize(
                  ETHERSCAN_NAMES[chainId]
                )}`}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filtered?.length ? ( // Loading skeleton rows
              <BasketSkeleton />
            ) : isExposure && exposureGroups ? (
              // Exposure view - grouped by native asset
              Array.from(exposureGroups.entries())
                .slice(0, viewAll ? exposureGroups.size : MAX_TOKENS)
                .map(([key, group]) => {
                  const native = group.native || {
                    symbol: key,
                    name: key,
                    logo: '',
                  }
                  return (
                    <TableRow key={native.symbol} className="border-none">
                      <TableCell>
                        <div className="flex items-center font-semibold gap-3 break-words">
                          <TokenLogo size="lg" src={native.logo} />
                          <div className="max-w-32 md:max-w-72 lg:max-w-56">
                            <span className="block">{native.name}</span>
                            <span className="block text-xs text-legend font-normal max-w-32 md:max-w-72 lg:max-w-52 break-words">
                              ${native.symbol}
                              {group.tokens.length > 1 && (
                                <span className="ml-1 text-muted-foreground">
                                  ({group.tokens.length} sources)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      {/* <TableCell className="text-center">
                        {native.marketCap
                          ? `$${(native.marketCap / 1e9).toFixed(1)}B`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {native.priceChange7d
                          ? `${native.priceChange7d.toFixed(1)}%`
                          : '-'}
                      </TableCell> */}
                      <TableCell className="text-primary text-center font-bold">
                        {group.totalWeight.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  )
                })
            ) : (
              filtered
                .slice(0, viewAll ? filtered.length : MAX_TOKENS)
                .map((token) => (
                  <TableRow key={token.symbol} className="border-none">
                    <TableCell>
                      <div className="flex items-center font-semibold gap-2 break-words">
                        <TokenLogo
                          size="lg"
                          symbol={token.symbol}
                          address={token.address}
                          chain={chainId}
                        />
                        <div className="max-w-32 md:max-w-72 lg:max-w-56">
                          <span className="block">
                            {getTokenName(token.name)}
                          </span>
                          <span className="block text-xs text-legend font-normal max-w-32 md:max-w-72 lg:max-w-52 break-words">
                            ${token.symbol}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-primary text-center font-bold">
                      {basketShares[token.address]}%
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <BridgeLabel address={token.address} />
                        <Button
                          variant="muted"
                          size="icon-rounded"
                          className="hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleCopy(token.address)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Link
                          to={getExplorerLink(
                            token.address,
                            chainId,
                            ExplorerDataType.TOKEN
                          )}
                          target="_blank"
                        >
                          <Button
                            variant="muted"
                            size="icon-rounded"
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Tabs>
      {filtered && filtered.length > MAX_TOKENS && (
        <Button
          variant="outline"
          className="w-full rounded-2xl"
          onClick={() => setViewAll(!viewAll)}
        >
          {viewAll ? 'View less' : `View all ${filtered.length} assets`}
        </Button>
      )}
    </div>
  )
}

export default IndexBasketOverview
