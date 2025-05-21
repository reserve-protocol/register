import DecimalDisplay from '@/components/decimal-display'
import { NumericalInput } from '@/components/ui/input'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'
import { formatPercentage } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowRight } from 'lucide-react'
import { formatUnits } from 'viem'
import {
  derivedProposedSharesAtom,
  IndexAssetShares,
  proposedIndexBasketAtom,
  proposedUnitsAtom,
} from '../../atoms'
import AssetCellInfo from './asset-info-cell'
import TokenSelector from './token-selector'

const NewUnitsCell = ({ asset }: { asset: string }) => {
  const [newUnits, setNewUnits] = useAtom(proposedUnitsAtom)

  return (
    <TableCell className="bg-primary/10 w-10">
      <NumericalInput
        placeholder={`0`}
        className="w-32 text-center"
        value={newUnits[asset]}
        onChange={(value) => setNewUnits({ ...newUnits, [asset]: value })}
      />
    </TableCell>
  )
}

const DeltaUnitsCell = ({ asset }: { asset: string }) => {
  const derivedProposedShares = useAtomValue(derivedProposedSharesAtom)
  const currentShares = useAtomValue(proposedIndexBasketAtom)

  const currentSharesDisplay = formatPercentage(
    Number(currentShares?.[asset]?.currentShares ?? 0)
  )
  let newShareDisplay = currentSharesDisplay

  if (derivedProposedShares?.[asset] !== undefined) {
    newShareDisplay = formatPercentage(
      Number(formatUnits(derivedProposedShares?.[asset], 16))
    )
  }

  return (
    <TableCell className="text-center">
      <div className="flex items-center justify-center gap-1">
        <span className="text-legend">{currentSharesDisplay}</span>
        <ArrowRight size={14} />
        <span>{newShareDisplay}</span>
      </div>
    </TableCell>
  )
}

const CurrentUnitsCell = ({ asset }: { asset: IndexAssetShares }) => (
  <TableCell className="text-right">
    <DecimalDisplay value={asset.currentUnits} />
  </TableCell>
)

const SetupTrackingDTFBasket = ({ assets }: { assets: IndexAssetShares[] }) => (
  <TableBody>
    {assets.map((asset) => (
      <TableRow key={asset.token.address}>
        <AssetCellInfo asset={asset} />
        <CurrentUnitsCell asset={asset} />
        <NewUnitsCell asset={asset.token.address} />
        <DeltaUnitsCell asset={asset.token.address} />
      </TableRow>
    ))}
    <TableRow className="hover:bg-card">
      <TableCell colSpan={4}>
        <div className="flex justify-center items-center">
          <TokenSelector />
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
)

export default SetupTrackingDTFBasket
