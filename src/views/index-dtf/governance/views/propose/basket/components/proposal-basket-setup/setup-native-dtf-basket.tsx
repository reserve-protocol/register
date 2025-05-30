import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatPercentage } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import {
  IndexAssetShares,
  proposedIndexBasketAtom,
  proposedIndexBasketStateAtom,
  proposedSharesAtom,
} from '../../atoms'
import AssetCellInfo from './asset-info-cell'
import TokenSelector from './token-selector'

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

const CurrentSharesCell = ({ asset }: { asset: IndexAssetShares }) => {
  const [targetShares, setTargetShares] = useAtom(proposedSharesAtom)

  const handleClick = () => {
    setTargetShares({
      ...targetShares,
      [asset.token.address]: asset.currentShares,
    })
  }

  return (
    <TableCell
      className="text-center cursor-pointer hover:text-primary"
      onClick={handleClick}
    >
      {formatPercentage(Number(asset.currentShares))}
    </TableCell>
  )
}

const Allocation = () => {
  const { remainingAllocation, isValid } = useAtomValue(
    proposedIndexBasketStateAtom
  )

  return (
    <div>
      <span className="text-legend">Remaining allocation:</span>{' '}
      <span
        className={cn(
          '',
          remainingAllocation !== 0 && !isValid && 'text-destructive'
        )}
      >
        {formatPercentage(remainingAllocation)}
      </span>
    </div>
  )
}

const EvenDistribution = () => {
  const [proposedShares, setProposedShares] = useAtom(proposedSharesAtom)

  const handleEvenDistribution = () => {
    const numTokens = Object.keys(proposedShares).length
    const evenShare = (100 / numTokens).toFixed(2)

    // Handle rounding error to ensure total is exactly 100
    const shares = Object.keys(proposedShares).map((key, i) => {
      if (i === numTokens - 1) {
        // Last token gets remaining balance to equal 100
        const sumOthers = (numTokens - 1) * Number(evenShare)
        return [key, (100 - sumOthers).toFixed(2)]
      }
      return [key, evenShare]
    })

    setProposedShares(Object.fromEntries(shares))
  }

  return (
    <Button variant="outline" size="sm" onClick={handleEvenDistribution}>
      Even distribution
    </Button>
  )
}

const SetupNativeDTFBasket = ({ assets }: { assets: IndexAssetShares[] }) => (
  <TableBody>
    {assets.map((asset) => (
      <TableRow key={asset.token.address}>
        <AssetCellInfo asset={asset} />
        <CurrentSharesCell asset={asset} />
        <NewSharesCell asset={asset.token.address} />
        <DeltaSharesCell asset={asset.token.address} />
      </TableRow>
    ))}
    <TableRow className="hover:bg-card">
      <TableCell colSpan={4}>
        <div className="flex justify-between items-center">
          <TokenSelector />
          <div className="flex flex-col gap-2">
            <EvenDistribution />
            <Allocation />
          </div>
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
)

export default SetupNativeDTFBasket
