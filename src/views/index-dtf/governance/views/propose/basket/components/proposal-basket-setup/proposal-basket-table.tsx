import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { isHybridDTFAtom } from '@/state/dtf/atoms'
import { BasketInputType } from '@/views/index-dtf/deploy/atoms'
import { atom, useAtom, useAtomValue } from 'jotai'
import {
  _basketInputTypeAtom,
  basketInputTypeAtom,
  IndexAssetShares,
  isUnitBasketAtom,
  proposedIndexBasketAtom,
} from '../../atoms'
import SetupNativeDTFBasket from './setup-native-dtf-basket'
import SetupTrackingDTFBasket from './setup-tracking-dtf-basket'
import Help from '@/components/help'
import { UNITS_DISCLAIMER } from '@/utils/constants'

const assetsAtom = atom((get) => {
  const proposedBasket = get(proposedIndexBasketAtom)

  if (!proposedBasket) return { isLoading: true, assets: [] }

  return { isLoading: false, assets: Object.values(proposedBasket) }
})

const UnitsHeader = () => {
  return (
    <div className="flex items-center justify-center gap-1">
      <span>New units</span>
      <Help content={UNITS_DISCLAIMER} />
    </div>
  )
}

const Header = () => {
  const isUnitBasket = useAtomValue(isUnitBasketAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const [basketInputType, setBasketInputType] = useAtom(_basketInputTypeAtom)

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="border-r min-w-48">Token</TableHead>
        <TableHead
          className={cn(isUnitBasket ? 'text-right w-36' : 'w-16 text-center')}
        >
          {isUnitBasket ? 'Old units' : 'Current'}
        </TableHead>
        <TableHead className="bg-primary/10 text-primary text-center font-bold">
          {isUnitBasket || isHybridDTF ? (
            <UnitsHeader />
          ) : (
            <ToggleGroup
              type="single"
              className="bg-muted-foreground/10 p-1 rounded-lg justify-start w-max py-1"
              value={basketInputType}
              onValueChange={(value) => {
                setBasketInputType(value as BasketInputType)
              }}
            >
              <ToggleGroupItem
                className="px-3 h-8 rounded-md data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
                value="unit"
              >
                Unit
              </ToggleGroupItem>
              <ToggleGroupItem
                className="px-3 h-8 rounded-md data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
                value="share"
              >
                Share
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </TableHead>
        <TableHead
          className={cn(isUnitBasket ? 'text-right w-24' : 'w-16 text-center')}
        >
          {isUnitBasket ? '% of Basket' : 'Delta'}
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

const Body = ({ assets }: { assets: IndexAssetShares[] }) => {
  const basketInputType = useAtomValue(basketInputTypeAtom)

  if (basketInputType === 'unit') {
    return <SetupTrackingDTFBasket assets={assets} />
  }

  return <SetupNativeDTFBasket assets={assets} />
}

const ProposalBasketTable = () => {
  const { assets, isLoading } = useAtomValue(assetsAtom)

  if (isLoading) {
    return <Skeleton className="h-[200px]" />
  }

  return (
    <div className="border rounded-xl overflow-auto">
      <Table>
        <Header />
        <Body assets={assets} />
      </Table>
    </div>
  )
}

export default ProposalBasketTable
