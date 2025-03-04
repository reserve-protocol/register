import { Box } from '@/components/ui/box'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage, getTokenName } from '@/utils'
import { useAtomValue } from 'jotai'
import {
  ArrowUpRight,
  Grid3x3,
  ExternalLink,
  FileText,
  BadgePercent,
} from 'lucide-react'

import DiscordIcon from '@/components/icons/DiscordIcon'
import TelegramIcon from '@/components/icons/TelegramIcon'
import XIcon from '@/components/icons/XIcon'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
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
  indexDTFBrandAtom,
  ITokenBasket,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { LinkIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

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

// TODO: had an scrollarea but it looks kind of odd?
// TODO: above will be a problem for... 50-100 token baskets.. solve in the future!
const IndexBasketTokens = ({
  basket,
  className,
}: {
  basket: Token[] | undefined
  className?: string
}) => {
  const [viewAll, setViewAll] = useState(false)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className={cn('relative ', className)}>
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
          {!basket?.length // Loading skeleton rows
            ? Array.from({ length: 10 }).map((_, i) => (
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
            : basket
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
                    <TableCell className="flex text-right justify-end py-6 pr-6">
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
      {basket && basket.length > MAX_TOKENS && (
        <Button
          variant="outline"
          className="w-full rounded-2xl py-5"
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

const SOCIAL_MAP: Record<string, { icon: React.ReactNode; label: string }> = {
  website: {
    icon: <LinkIcon size={14} />,
    label: 'Website',
  },
  telegram: {
    icon: <TelegramIcon />,
    label: 'Telegram',
  },
  discord: {
    icon: <DiscordIcon />,
    label: 'Discord',
  },
  twitter: {
    icon: <XIcon width={20} height={20} />,
    label: 'Twitter',
  },
}

const TokenSocials = () => {
  const data = useAtomValue(indexDTFBrandAtom)

  if (!data) {
    return <Skeleton className="w-60 h-6" />
  }

  return (
    <div className="flex gap-2 mt-4 flex-wrap">
      {data.dtf?.prospectus && (
        <Link
          to={data.dtf.prospectus}
          target="_blank"
          className="flex items-center gap-2 border rounded-full py-1 px-2 text-sm hover:bg-primary/10 hover:text-primary"
        >
          <FileText size={14} />
          DTF Factsheet
        </Link>
      )}
      {Object.entries(data?.socials || {}).map(
        ([key, value]) =>
          !!value && (
            <Link
              key={key}
              to={value}
              target="_blank"
              className="flex items-center gap-2 border rounded-full py-1 px-2 text-sm hover:bg-primary/10 hover:text-primary"
            >
              {SOCIAL_MAP[key].icon}
              {SOCIAL_MAP[key].label}
            </Link>
          )
      )}
    </div>
  )
}

const Mandate = () => {
  const data = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)

  if (!data || !brandData) {
    return <Skeleton className="w-full h-20" />
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">About this DTF</h2>
      {!data ? (
        <div>
          <Skeleton className="w-full h-20" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-legend">
            {brandData.dtf?.description || data.mandate}
          </p>
        </div>
      )}
    </div>
  )
}

const Header = () => {
  const data = useAtomValue(indexDTFAtom)

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="rounded-full border border-foreground p-2 mr-auto">
        <Grid3x3 size={16} strokeWidth={1.5} />
      </div>

      {!data ? (
        <Skeleton className="w-60 h-6" />
      ) : (
        <div className="flex gap-1 items-center">
          <BadgePercent size={16} strokeWidth={1.5} />
          <span className="text-legend">TVL Fee:</span>
          <span className="font-bold">
            {formatPercentage(data.annualizedTvlFee * 100)}
          </span>
        </div>
      )}
    </div>
  )
}

const IndexAboutOverview = () => (
  <Card className="p-4 sm:p-6">
    <Header />
    <Mandate />
    <TokenSocials />
    <Separator className="mt-4 mb-2 -mx-2" />
    <IndexBasketPreview />
  </Card>
)

export default IndexAboutOverview
