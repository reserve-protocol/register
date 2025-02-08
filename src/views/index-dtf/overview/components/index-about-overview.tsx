import { Box } from '@/components/ui/box'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, BrickWall } from 'lucide-react'

import Money from '@/components/icons/Money'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
import {
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  ITokenBasket,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'

interface BasketOverviewProps extends React.HTMLAttributes<HTMLDivElement> {
  basket: ITokenBasket
}

const IndexBasketVisual = ({ basket, ...props }: BasketOverviewProps) => {
  const MAX_BAR_TOKENS = 4
  const { tokens, percents } = basket
  const emptySpaces =
    tokens.length > MAX_BAR_TOKENS
      ? Math.min(3, tokens.length - MAX_BAR_TOKENS)
      : 0 // Number of empty spaces to show

  return (
    <div
      className="relative h-20 rounded-lg overflow-hidden -mx-2 sm:-mx-4"
      {...props}
    >
      {/* Token sections */}
      {tokens.slice(0, MAX_BAR_TOKENS).map((token, index) => (
        <div
          key={token.symbol}
          className="absolute top-0 bottom-0"
          style={{
            left: `${index * (100 / (MAX_BAR_TOKENS + emptySpaces))}%`,
            width: `${100 / (MAX_BAR_TOKENS + emptySpaces)}%`,
            paddingLeft: index === 0 ? '0' : '8px',
          }}
        >
          <div className="relative w-full h-full bg-muted/90 flex items-center justify-center">
            <TokenLogo
              alt={token.name}
              symbol={token.symbol}
              // className="object-cover"
            />
          </div>
        </div>
      ))}

      {/* Empty spaces for additional tokens */}
      {!!emptySpaces &&
        Array.from({ length: emptySpaces }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${(MAX_BAR_TOKENS + index) * (100 / (MAX_BAR_TOKENS + emptySpaces))}%`,
              width: `${100 / (MAX_BAR_TOKENS + emptySpaces)}%`,
              paddingLeft: '8px',
            }}
          >
            <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
              {/* Empty space content */}
            </div>
          </div>
        ))}

      {/* Vertical divider lines */}
      {Array.from({ length: MAX_BAR_TOKENS + emptySpaces - 1 }).map(
        (_, index) => (
          <div
            key={`divider-${index}`}
            className="absolute top-1.5 bottom-1.5 w-px bg-gray-200"
            style={{
              left: `${(index + 1) * (100 / (MAX_BAR_TOKENS + emptySpaces))}%`,
            }}
          />
        )
      )}
    </div>
  )
}

const MAX_TOKENS = 10

const IndexBasketTokens = ({
  basket,
  className,
}: {
  basket: Token[]
  className?: string
}) => {
  const [viewAll, setViewAll] = useState(false)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className={cn('relative', className)}>
      <ScrollArea
        className={cn(
          'flex max-h-[620px] flex-col overflow-y-auto',
          viewAll && basket.length > MAX_TOKENS && 'max-h-[1240px]'
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-none text-legend bg-card sticky top-0 ">
              <TableHead>Token</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-center">Weight</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {basket
              .slice(0, viewAll ? basket.length : MAX_TOKENS)
              .map((token, index) => (
                <TableRow key={token.symbol} className="border-none">
                  <TableCell>
                    <div className="flex items-center font-semibold gap-2">
                      <TokenLogo
                        size="lg"
                        symbol={token.symbol}
                        address={token.address}
                        chain={chainId}
                      />
                      {token.name}
                    </div>
                  </TableCell>
                  <TableCell>${token.symbol}</TableCell>
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
              ))}
          </TableBody>
        </Table>
      </ScrollArea>
      {basket.length > MAX_TOKENS && (
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

const IndexBasketPreview = () => {
  const basket = useAtomValue(indexDTFBasketAtom)

  if (!basket) {
    return <Skeleton className="mt-2 w-full h-20" />
  }

  return (
    <div>
      {/* <IndexBasketVisual basket={basket} /> */}
      <IndexBasketTokens
        className="-mx-4 sm:-mx-5 -mb-4 sm:-mb-5"
        basket={basket}
      />
    </div>
  )
}

const IndexAboutOverview = () => {
  const data = useAtomValue(indexDTFAtom)

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-16">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <BrickWall size={20} />
        </div>

        {!data ? (
          <Skeleton className="w-60 h-6" />
        ) : (
          <div className="flex gap-1 items-center">
            <Money />
            <span className="text-legend">TVL Fee:</span>
            <span className="font-bold">
              {formatPercentage(data.annualizedTvlFee * 100)}
            </span>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-4xl mb-2">About this DTF</h2>
        {!data ? (
          <div>
            <Skeleton className="w-full h-20" />
          </div>
        ) : (
          <p className="text-legend">{data.mandate}</p>
        )}
      </div>
      <Separator className="mt-4 mb-2 -mx-2" />
      <IndexBasketPreview />
    </Card>
  )
}

export default IndexAboutOverview
