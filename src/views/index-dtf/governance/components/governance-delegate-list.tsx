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
import { IndexDtfDelegate, useIndexDtfDelegates } from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { User2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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

const DelegateTable = ({ delegates, isLoading, chainId, isOptimistic }: { delegates: readonly IndexDtfDelegate[] | undefined, isLoading: boolean, chainId: number, isOptimistic: boolean }) => (
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
      {isLoading && (
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
)

const DelegateListOptions = () => (
  <TabsList >
    <TabsTrigger value="normal" className='text-xs'>
      Normal
    </TabsTrigger>
    <TabsTrigger value="optimistic" className='text-xs'>
      Optimistic
    </TabsTrigger>
  </TabsList>
)

const GovernanceDelegateList = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data, isLoading } = useIndexDtfDelegates(!dtf?.stToken ? undefined : {
    chainId: dtf.chainId,
    stToken: dtf.stToken.id
  })
  const [currentTab, setTab] = useState<DelegateTabs>('normal')
  const hasOptimisticGovernance = !!dtf?.ownerGovernance?.isOptimistic

  useEffect(() => {
    if (!hasOptimisticGovernance && currentTab === 'optimistic') {
      setTab('normal')
    }
  }, [currentTab, hasOptimisticGovernance])

  const isOptimistic = currentTab === 'optimistic'
  const delegates = useMemo(() => {
    if (!isOptimistic) {
      return data?.normalDelegates
    }

    return data?.optimisticDelegates
  }, [isOptimistic, data])

  return (
    <Tabs value={currentTab} onValueChange={(value) => setTab(value as DelegateTabs)} className="rounded-4xl bg-background">
      <div className="flex items-center gap-2 py-4 px-4">
        <div className="border rounded-full border-foreground p-1">
          <User2 size={14} />
        </div>
        <h2 className="font-semibold text-xl text-primary ml-1 mr-auto">Delegates</h2>
        {hasOptimisticGovernance && (
          <DelegateListOptions />
        )}
      </div>
      <div className="bg-card mr-1 mt-0 rounded-3xl overflow-auto">
        <DelegateTable delegates={delegates} isLoading={!dtf || isLoading} chainId={chainId} isOptimistic={isOptimistic} />
      </div>
    </Tabs>
  )
}

export default GovernanceDelegateList
