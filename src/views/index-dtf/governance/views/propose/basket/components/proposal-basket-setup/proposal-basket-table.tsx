import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { atom, useAtom, useAtomValue } from 'jotai'
import {
  basketInputTypeAtom,
  IndexAssetShares,
  isUnitBasketAtom,
  proposedIndexBasketAtom,
} from '../../atoms'
import SetupNativeDTFBasket from './setup-native-dtf-basket'
import SetupTrackingDTFBasket from './setup-tracking-dtf-basket'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BasketInputType } from '@/views/index-dtf/deploy/atoms'

const assetsAtom = atom((get) => {
  const proposedBasket = get(proposedIndexBasketAtom)

  if (!proposedBasket) return { isLoading: true, assets: [] }

  return { isLoading: false, assets: Object.values(proposedBasket) }
})

const Header = ({ isUnitBasket }: { isUnitBasket: boolean }) => {
  const [basketInputType, setBasketInputType] = useAtom(basketInputTypeAtom)

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="border-r min-w-48">Token</TableHead>
        <TableHead
          className={cn(isUnitBasket ? 'text-right w-36' : 'w-16 text-center')}
        >
          {isUnitBasket ? 'Old Tokens / DTF' : 'Current'}
        </TableHead>
        <TableHead className="bg-primary/10 text-primary text-center font-bold">
          {isUnitBasket ? (
            'New Tokens / DTF'
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

const Body = ({
  assets,
  isUnitBasket,
}: {
  assets: IndexAssetShares[]
  isUnitBasket: boolean
}) => {
  const [basketInputType] = useAtom(basketInputTypeAtom)

  if (isUnitBasket || basketInputType === 'unit') {
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
