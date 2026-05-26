import { formatCurrency, formatPercentage } from '@/utils'

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
import EnsName from '@/components/utils/ens-name'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useIndexDtfDelegates } from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type DelegateTabs = 'normal' | 'optimistic'

const LoadingSkeleton = () => (
  <TableRow>
    <TableCell className="text-center text-legend" colSpan={4}>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 mt-2 w-full" />
      <Skeleton className="h-8 mt-2 w-full" />
      <Skeleton className="h-8 mt-2 w-full" />
    </TableCell>
  </TableRow>
)

const EmptySkeleton = () => (
  <TableRow>
    <TableCell className="text-center text-legend" colSpan={4}>
      No delegates found
    </TableCell>
  </TableRow>
)

const GovernanceDelegateList = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data, isLoading } = useIndexDtfDelegates(!dtf?.stToken ? undefined : {
    chainId: dtf.chainId,
    stToken: dtf.stToken.id
  })
  const [currentTab, setTab] = useState<DelegateTabs>('normal')

  const isOptimistic = currentTab === 'optimistic'
  const delegates = useMemo(() => {
    if (!isOptimistic) {
      return data?.normalDelegates
    }

    return data?.optimisticDelegates
  }, [isOptimistic, data])


  return (
    <Tabs value={currentTab} onValueChange={(value) => setTab(value as DelegateTabs)}>
      <div className="rounded-4xl bg-background ">
        <div className="flex items-center gap-2 py-4 px-5">
          <h2 className="font-semibold mr-auto">Top {isOptimistic ? 'veto' : 'voting'} addresses</h2>
          <TabsList >
            <TabsTrigger value="normal">
              Normal
            </TabsTrigger>
            <TabsTrigger value="optimistic">
              Optimistic
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="bg-card m-1 mt-0 rounded-3xl overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-none text-legend">
                <TableHead>Address</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Vote weight</TableHead>
                {/* <TableHead>Proposals voted</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!dtf || isLoading) && (
                <LoadingSkeleton />
              )}
              {delegates !== undefined && delegates.length === 0 && (
                <EmptySkeleton />
              )}
              {delegates &&
                delegates.map((delegate) => (
                  <TableRow key={delegate.address}>
                    <TableCell>
                      <Link
                        target="_blank"
                        className="text-legend underline"
                        to={getExplorerLink(
                          delegate.address,
                          chainId,
                          ExplorerDataType.ADDRESS
                        )}
                      >
                        <EnsName address={delegate.address} />
                      </Link>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(isOptimistic ? delegate.optimisticDelegatedVotes.formatted : delegate.delegatedVotes.formatted), 2)}
                    </TableCell>
                    <TableCell>
                      {formatPercentage(isOptimistic ? delegate.optimisticWeightedVotes : delegate.weightedVotes)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Tabs>
  )
}

export default GovernanceDelegateList
