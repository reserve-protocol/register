import { Button } from '@/components/ui/button'
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useScrollTo from '@/hooks/useScrollTo'
import { cn } from '@/lib/utils'
import { capitalize } from '@/utils/constants'
import { ETHERSCAN_NAMES } from '@/utils/getExplorerLink'
import { PackageOpen, Target } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BasketTableBody } from './basket-table-body'
import { useBasketOverviewData } from './use-basket-overview-data'

const MAX_TOKENS = 10

const BasketTableHeader = ({
  isBSC,
  isExposure,
  hasBridgedAssets,
  chainId,
  setActiveTab,
}: {
  isBSC: boolean
  isExposure: boolean
  hasBridgedAssets: boolean
  chainId: number
  setActiveTab: (tab: 'exposure' | 'collateral') => void
}) => {
  return (
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
        {!isExposure && <TableHead className="text-center">Weight</TableHead>}
        {isExposure && (
          <TableHead className="text-center">Market Cap</TableHead>
        )}
        <TableHead className="text-center">7d Change</TableHead>
        {isExposure && <TableHead className="text-right">Weight</TableHead>}
        <TableHead className={cn('text-right', isExposure && 'hidden')}>
          {`${hasBridgedAssets ? 'Bridge / ' : ''}${capitalize(
            ETHERSCAN_NAMES[chainId]
          )}`}
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

const IndexBasketOverview = () => {
  const [viewAll, setViewAll] = useState(false)
  const [activeTab, setActiveTab] = useState<'exposure' | 'collateral'>(
    'collateral'
  )
  const isExposure = activeTab === 'exposure'
  const scrollTo = useScrollTo('basket', 80)

  const {
    basket,
    filtered,
    exposureGroups,
    basketShares,
    basket7dChanges,
    hasBridgedAssets,
    chainId,
    marketCaps,
    isBSC,
  } = useBasketOverviewData(isExposure)

  // Update active tab when chain changes
  useEffect(() => {
    if (isBSC) {
      setActiveTab('exposure')
    } else {
      setActiveTab('collateral')
    }
  }, [isBSC])

  // Handle scroll to basket on hash change
  useEffect(() => {
    const section = window.location.hash.slice(1)
    if (section === 'basket' && basket?.length) {
      setTimeout(() => {
        scrollTo()
      }, 100)
    }
  }, [scrollTo, basket])

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="relative -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-1" id="basket">
      <Tabs defaultValue="exposure">
        <Table>
          <BasketTableHeader
            isBSC={isBSC}
            isExposure={isExposure}
            hasBridgedAssets={hasBridgedAssets || false}
            chainId={chainId}
            setActiveTab={setActiveTab}
          />
          <BasketTableBody
            filtered={filtered}
            isExposure={isExposure}
            exposureGroups={exposureGroups}
            basketShares={basketShares}
            basket7dChanges={basket7dChanges}
            marketCaps={marketCaps}
            chainId={chainId}
            viewAll={viewAll}
            maxTokens={MAX_TOKENS}
            onCopyAddress={handleCopyAddress}
          />
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
