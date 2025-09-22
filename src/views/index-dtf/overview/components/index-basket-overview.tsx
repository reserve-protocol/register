import TokenLogo from '@/components/token-logo'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useScrollTo from '@/hooks/useScrollTo'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import {
  hasBridgedAssetsAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
} from '@/state/dtf/atoms'
import { getTokenName } from '@/utils'
import { capitalize } from '@/utils/constants'
import {
  ETHERSCAN_NAMES,
  ExplorerDataType,
  getExplorerLink,
} from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BridgeLabel from './bridge-label'
import IndexTokenAddress from './index-token-address'

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
const IndexBasketOverviewContent = ({ className }: { className?: string }) => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const [viewAll, setViewAll] = useState(false)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const hasBridgedAssets = useAtomValue(hasBridgedAssetsAtom)
  const chainId = useAtomValue(chainIdAtom)

  const scrollTo = useScrollTo('basket', 80)

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

  return (
    <div
      className={cn('relative -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-1', className)}
      id="basket"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-none text-legend bg-card sticky top-0 ">
            <TableHead className="text-left">Token</TableHead>
            <TableHead className="hidden sm:table-cell">Ticker</TableHead>
            <TableHead className="text-center">Weight</TableHead>
            <TableHead className="text-right">
              {`${hasBridgedAssets ? 'Bridge / ' : ''}${capitalize(
                ETHERSCAN_NAMES[chainId]
              )}`}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!filtered?.length ? ( // Loading skeleton rows
            <BasketSkeleton />
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
                  <TableCell className="hidden sm:table-cell">
                    <span className="sm:max-w-20 break-words">
                      ${token.symbol}
                    </span>
                  </TableCell>
                  <TableCell className="text-primary text-center font-bold">
                    {basketShares[token.address]}%
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <BridgeLabel address={token.address} />
                      <Link
                        to={getExplorerLink(
                          token.address,
                          chainId,
                          ExplorerDataType.TOKEN
                        )}
                        target="_blank"
                      >
                        <Box
                          variant="circle"
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Box>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
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

const IndexBasketOverview = () => (
  <Card className="py-4 sm:py-6 -mt-[1px]">
    <div className="px-4 sm:px-6 flex items-center gap-2 justify-between">
      <h2 className="text-2xl font-light">Assets in this DTF</h2>
      <IndexTokenAddress />
    </div>
    <Separator className="mt-6 mb-3" />
    <div className="px-4 sm:px-6">
      <IndexBasketOverviewContent />
    </div>
  </Card>
)

export default IndexBasketOverview
