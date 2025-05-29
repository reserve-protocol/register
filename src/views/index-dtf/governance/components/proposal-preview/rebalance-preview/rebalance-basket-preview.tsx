import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Token } from '@/types'
import { formatPercentage, shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export type EstimatedBasketAsset = {
  token: Token
  currentShares: string
  targetShares: string
  delta: number
}

export type EstimatedBasket = Record<string, EstimatedBasketAsset>

const RebalanceBasketPreview = ({
  basket,
}: {
  basket: EstimatedBasket | undefined
}) => {
  const chainId = useAtomValue(chainIdAtom)

  if (!basket) return <Skeleton className="h-[200px]" />

  return (
    <div className="rounded-3xl bg-card overflow-auto">
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
              <TableCell className="border-r min-w-48">
                <Link
                  target="_blank"
                  to={getExplorerLink(
                    asset.token.address,
                    chainId,
                    ExplorerDataType.TOKEN
                  )}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <TokenLogo
                    size="xl"
                    symbol={asset.token.symbol}
                    address={asset.token.address}
                    chain={chainId}
                  />
                  <div className="mr-auto">
                    <h4 className="font-bold mb-1 group-hover:text-primary">
                      {asset.token.symbol}
                    </h4>
                    <p className="text-sm text-legend">
                      {shortenAddress(asset.token.address)}{' '}
                      <ArrowUpRight size={14} className="inline" />
                    </p>
                  </div>
                </Link>
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

export default RebalanceBasketPreview
