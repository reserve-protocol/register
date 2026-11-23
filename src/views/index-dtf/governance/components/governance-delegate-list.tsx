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
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { Trans } from '@lingui/react/macro'
import AddressHovercard, {
  AddressHovercardGroup,
} from '@/components/governance/address-hovercard'
import {
  IndexDtfDelegate,
  useIndexDtfDelegates,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

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
      <Trans>No delegates found</Trans>
    </TableCell>
  </TableRow>
)

const DelegateTable = ({
  delegates,
  isLoading,
  isOptimistic,
}: {
  delegates: readonly IndexDtfDelegate[] | undefined
  isLoading: boolean
  isOptimistic: boolean
}) => (
  <Table>
    <TableHeader>
      <TableRow className="border-none text-legend">
        <TableHead>
          <Trans>Address</Trans>
        </TableHead>
        <TableHead>
          <Trans>Votes</Trans>
        </TableHead>
        <TableHead>
          <Trans>Vote weight</Trans>
        </TableHead>
        {/* <TableHead>Proposals voted</TableHead> */}
      </TableRow>
    </TableHeader>
    <TableBody>
      {isLoading && <LoadingSkeleton />}
      {delegates !== undefined && delegates.length === 0 && <EmptySkeleton />}
      {delegates &&
        delegates.map((delegate) => (
          <TableRow key={delegate.address}>
            <TableCell>
              <AddressHovercard
                address={delegate.address}
                surface="delegates"
                className="text-legend"
              >
                <EnsName address={delegate.address} />
              </AddressHovercard>
            </TableCell>
            <TableCell>
              {formatCurrency(
                Number(
                  isOptimistic
                    ? delegate.optimisticDelegatedVotes.formatted
                    : delegate.delegatedVotes.formatted
                ),
                2
              )}
            </TableCell>
            <TableCell>
              {formatPercentage(
                isOptimistic
                  ? delegate.optimisticWeightedVotes
                  : delegate.weightedVotes
              )}
            </TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>
)

const DelegateListOptions = () => (
  <TabsList>
    <TabsTrigger value="normal" className="text-sm">
      <Trans>Normal</Trans>
    </TabsTrigger>
    <TabsTrigger value="optimistic" className="text-sm">
      <Trans>Optimistic</Trans>
    </TabsTrigger>
  </TabsList>
)

const GovernanceDelegateList = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const { data, isLoading } = useIndexDtfDelegates(
    !dtf?.stToken
      ? undefined
      : {
          chainId: dtf.chainId,
          stToken: dtf.stToken.id,
        }
  )
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
    <Tabs
      value={currentTab}
      onValueChange={(value) => setTab(value as DelegateTabs)}
      className="rounded-4xl bg-background"
    >
      <div className="flex items-center px-6 pt-6 pb-2">
        <h2 className="text-xl font-semibold text-card-foreground mr-auto">
          <Trans>Delegates</Trans>
        </h2>
        {hasOptimisticGovernance && <DelegateListOptions />}
      </div>
      <div className="overflow-auto px-2 pb-2 pt-2">
        <AddressHovercardGroup
          addresses={(delegates ?? []).map((delegate) => delegate.address)}
        >
          <DelegateTable
            delegates={delegates}
            isLoading={!dtf || isLoading}
            isOptimistic={isOptimistic}
          />
        </AddressHovercardGroup>
      </div>
    </Tabs>
  )
}

export default GovernanceDelegateList
