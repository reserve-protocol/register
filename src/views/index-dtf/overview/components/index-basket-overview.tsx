import { Box } from '@/components/ui/box'
import { Skeleton } from '@/components/ui/skeleton'
import { getTokenName } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom, indexDTFBasketSharesAtom } from '@/state/dtf/atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const MAX_TOKENS = 10

const BasketSkeleton = () =>
  Array.from({ length: 10 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
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
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className={cn('relative -mx-4 sm:-mx-5 -mb-4 sm:-mb-5', className)}>
      <Table className="sm:mx-1">
        <TableHeader>
          <TableRow className="border-none text-legend bg-card sticky top-0 ">
            <TableHead>Token</TableHead>
            <TableHead className="hidden sm:table-cell">Ticker</TableHead>
            <TableHead className="text-center">Weight</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!basket?.length ? ( // Loading skeleton rows
            <BasketSkeleton />
          ) : (
            basket
              .slice(0, viewAll ? basket.length : MAX_TOKENS)
              .map((token, index) => (
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
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
      {basket && basket.length > MAX_TOKENS && (
        <Button
          variant="outline"
          className="w-full rounded-2xl"
          onClick={() => setViewAll(!viewAll)}
        >
          {viewAll ? 'View less' : `View all ${basket.length} assets`}
        </Button>
      )}
    </div>
  )
}

export default IndexBasketOverview
