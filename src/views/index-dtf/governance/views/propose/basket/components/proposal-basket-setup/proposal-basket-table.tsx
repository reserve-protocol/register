import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { atom, useAtomValue } from 'jotai'
import {
  IndexAssetShares,
  isUnitBasketAtom,
  proposedIndexBasketAtom,
} from '../../atoms'
import SetupNativeDTFBasket from './setup-native-dtf-basket'
import SetupTrackingDTFBasket from './setup-tracking-dtf-basket'

const assetsAtom = atom((get) => {
  const proposedBasket = get(proposedIndexBasketAtom)

  if (!proposedBasket) return { isLoading: true, assets: [] }

  return { isLoading: false, assets: Object.values(proposedBasket) }
})

const Header = ({ isUnitBasket }: { isUnitBasket: boolean }) => (
  <TableHeader>
    <TableRow>
      <TableHead className="border-r min-w-48">Token</TableHead>
      <TableHead
        className={cn(isUnitBasket ? 'text-right w-36' : 'w-16 text-center')}
      >
        {isUnitBasket ? 'Old Tokens / DTF' : 'Current'}
      </TableHead>
      <TableHead className="bg-primary/10 text-primary text-center font-bold">
        {isUnitBasket ? 'New Tokens / DTF' : 'New'}
      </TableHead>
      <TableHead
        className={cn(isUnitBasket ? 'text-right w-24' : 'w-16 text-center')}
      >
        {isUnitBasket ? '% of Basket' : 'Delta'}
      </TableHead>
    </TableRow>
  </TableHeader>
)

const Body = ({
  assets,
  isUnitBasket,
}: {
  assets: IndexAssetShares[]
  isUnitBasket: boolean
}) => {
  if (isUnitBasket) {
    return <SetupTrackingDTFBasket assets={assets} />
  }

  return <SetupNativeDTFBasket assets={assets} />
}

const ProposalBasketTable = () => {
  const { assets, isLoading } = useAtomValue(assetsAtom)
  const isUnitBasket = useAtomValue(isUnitBasketAtom)

  if (isLoading) {
    return <Skeleton className="h-[200px]" />
  }

  return (
    <div className="border rounded-xl overflow-auto">
      <Table>
        <Header isUnitBasket={isUnitBasket} />
        <Body assets={assets} isUnitBasket={isUnitBasket} />
      </Table>
    </div>
  )
}

export default ProposalBasketTable
