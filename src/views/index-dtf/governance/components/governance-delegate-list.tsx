import { formatCurrency, formatPercentage, shortenAddress } from '@/utils'

import {
  TableCell,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAtomValue } from 'jotai'
import { topDelegatesAtom } from '../atoms'
import { Skeleton } from '@/components/ui/skeleton'

// TODO: Get ENS for address
const GovernanceDelegateList = () => {
  const delegates = useAtomValue(topDelegatesAtom)

  return (
    <div className="rounded-4xl bg-secondary ">
      <div className="py-4 px-5">
        <h2 className="font-semibold text-xl text-primary dark:text-muted-foreground">
          Top voting addresses
        </h2>
      </div>
      <div className="bg-card m-1 mt-0 rounded-3xl">
        <Table>
          <TableHeader>
            <TableRow className="border-none text-legend">
              <TableHead>Address</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Vote weight</TableHead>
              <TableHead>Proposals voted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {delegates === undefined && (
              <TableRow>
                <TableCell className="text-center text-legend" colSpan={4}>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 mt-2 w-full" />
                  <Skeleton className="h-8 mt-2 w-full" />
                  <Skeleton className="h-8 mt-2 w-full" />
                </TableCell>
              </TableRow>
            )}
            {delegates !== undefined && delegates.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-legend" colSpan={4}>
                  No delegates found
                </TableCell>
              </TableRow>
            )}
            {delegates &&
              delegates.map((delegate) => (
                <TableRow key={delegate.address}>
                  <TableCell>{shortenAddress(delegate.address)}</TableCell>
                  <TableCell>
                    {formatCurrency(delegate.delegatedVotes, 2)}
                  </TableCell>
                  <TableCell>
                    {formatPercentage(delegate.weightedVotes)}
                  </TableCell>
                  <TableCell>{delegate.numberVotes}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default GovernanceDelegateList
