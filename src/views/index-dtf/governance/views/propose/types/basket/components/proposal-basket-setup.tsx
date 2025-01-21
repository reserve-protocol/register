import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
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
import { chainIdAtom } from '@/state/chain/atoms/chainAtoms'
import { formatPercentage, shortenAddress } from '@/utils'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  IndexAssetShares,
  isProposedBasketValidAtom,
  proposedIndexBasketAtom,
  proposedIndexBasketStateAtom,
  proposedSharesAtom,
  stepAtom,
} from '../atoms'
import TokenSelectorDrawer, {
  TokenDrawerTrigger,
} from '@/components/token-selector-drawer'

const assetsAtom = atom((get) => {
  const proposedBasket = get(proposedIndexBasketAtom)

  if (!proposedBasket) return { isLoading: true, assets: [] }

  return { isLoading: false, assets: Object.values(proposedBasket) }
})

const NewSharesCell = ({ asset }: { asset: string }) => {
  const [newShares, setNewShares] = useAtom(proposedSharesAtom)

  return (
    <TableCell className="bg-primary/10 w-10">
      <NumericalInput
        placeholder="0%"
        className="w-24 text-center"
        value={newShares[asset]}
        onChange={(value) => setNewShares({ ...newShares, [asset]: value })}
      />
    </TableCell>
  )
}

const DeltaSharesCell = ({ asset }: { asset: string }) => {
  const currentShares = useAtomValue(proposedIndexBasketAtom)
  const newShares = useAtomValue(proposedSharesAtom)
  const deltaShares =
    Number(newShares[asset] ?? 0) -
    Number(currentShares?.[asset]?.currentShares ?? 0)

  return (
    <TableCell
      className={cn('text-center', {
        'text-green-500': deltaShares > 0,
        'text-red-500': deltaShares < 0,
        'text-gray-500': deltaShares === 0,
      })}
    >
      {deltaShares > 0 && '+'}
      {formatPercentage(deltaShares)}
    </TableCell>
  )
}

const AssetRow = ({ asset }: { asset: IndexAssetShares }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <TableRow>
      <TableCell className="border-r">
        <div className="flex items-center gap-2">
          <TokenLogo size="xl" address={asset.token.address} chain={chainId} />
          <div>
            <h4 className="font-bold mb-1">{asset.token.symbol}</h4>
            <p className="text-sm text-legend">
              {shortenAddress(asset.token.address)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {formatPercentage(Number(asset.currentShares))}
      </TableCell>
      <NewSharesCell asset={asset.token.address} />
      <DeltaSharesCell asset={asset.token.address} />
    </TableRow>
  )
}

const Allocation = () => {
  const { remainingAllocation } = useAtomValue(proposedIndexBasketStateAtom)

  return (
    <div>
      <span className="text-legend">Remaining allocation:</span>{' '}
      <span className={cn('', remainingAllocation !== 0 && 'text-destructive')}>
        {formatPercentage(remainingAllocation)}
      </span>
    </div>
  )
}

const TokenSelector = () => {
  // const [selectedTokens, setSelectedTokens] = useAtom(selectedTokensAtom)

  return (
    <TokenSelectorDrawer
      selectedTokens={[]}
      onAdd={() => {}}
      onClose={() => {}}
    >
      <TokenDrawerTrigger className="mr-auto" />
    </TokenSelectorDrawer>
  )
}

const ProposalBasketTable = () => {
  const { assets, isLoading } = useAtomValue(assetsAtom)

  if (isLoading) {
    return <Skeleton className="h-[200px]" />
  }

  return (
    <div className="border rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border-r ">Token</TableHead>
            <TableHead className="w-24 text-center">Current</TableHead>
            <TableHead className="bg-primary/10 text-primary text-center font-bold">
              New
            </TableHead>
            <TableHead className="w-24 text-center">Delta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <AssetRow key={asset.token.address} asset={asset} />
          ))}
          <TableRow className="hover:bg-card">
            <TableCell colSpan={4}>
              <div className="flex items-center">
                <TokenSelector />
                <Allocation />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

const NextButton = () => {
  const isValid = useAtomValue(isProposedBasketValidAtom)
  const setStep = useSetAtom(stepAtom)
  const handleNext = () => {
    setStep('prices')
  }

  return (
    <Button
      disabled={!isValid}
      onClick={handleNext}
      className="w-full my-2"
      size="lg"
    >
      Next | Set price range(s)
    </Button>
  )
}

const ProposalBasketSetup = () => {
  return (
    <>
      <p className="mx-6 mb-6">
        Set the new desired percentages and we will calculate the required
        trades needed to adopt the new basket if the proposal passes governance.
      </p>
      <div className="flex flex-col gap-2 mx-2">
        <ProposalBasketTable />
        <NextButton />
      </div>
    </>
  )
}

export default ProposalBasketSetup
