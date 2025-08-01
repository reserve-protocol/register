import { TableCell, TableRow } from '@/components/ui/table'
import { NumericalInput } from '@/components/ui/input'
import TokenLogo from '@/components/token-logo'
import { formatPercentage } from '@/utils'
import { XIcon, ArrowRight } from 'lucide-react'
import { BasketItem } from '../atoms'
import { ColumnType } from '../basket-table'
import { useBasketSetup } from '../hooks/use-basket-setup'
import DecimalDisplay from '@/components/decimal-display'

interface UnitInputRowProps {
  item: BasketItem
  columns: ColumnType[]
  readOnly?: boolean
}

export const UnitInputRow = ({ item, columns, readOnly }: UnitInputRowProps) => {
  const { proposedUnits, updateProposedValue, removeToken, calculatedShares } = useBasketSetup()
  const address = item.token.address.toLowerCase()
  const currentUnits = item.currentValue
  const proposedUnit = proposedUnits[address] || currentUnits || '0'
  const calculatedShare = calculatedShares[address] || '0'

  const renderCell = (column: ColumnType) => {
    switch (column) {
      case 'token':
        return (
          <TableCell className="border-r">
            <div className="flex items-center gap-2">
              <TokenLogo 
                size="xl"
                symbol={item.token.symbol} 
                address={item.token.address}
              />
              <div>
                <h4 className="font-bold mb-1">{item.token.symbol}</h4>
                <span className="text-sm text-legend">{item.token.name}</span>
              </div>
            </div>
          </TableCell>
        )
      
      case 'current':
        return (
          <TableCell className="text-right">
            <DecimalDisplay value={currentUnits} />
          </TableCell>
        )
      
      case 'input':
        return (
          <TableCell className="bg-primary/10">
            <NumericalInput
              placeholder="0"
              className="w-32 text-center mx-auto"
              value={proposedUnit}
              onChange={(value) => updateProposedValue(address, value)}
              disabled={readOnly}
            />
          </TableCell>
        )
      
      case 'delta':
        // For units, show the share percentage change
        const currentShareValue = item.proposedValue || '0' // This would need to be calculated
        return (
          <TableCell className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-legend">{formatPercentage(Number(currentShareValue))}</span>
              <ArrowRight size={14} />
              <span>{formatPercentage(Number(calculatedShare))}</span>
            </div>
          </TableCell>
        )
      
      case 'allocation':
        // For units mode, show current % -> new % like in basket proposal
        const currentSharePercent = item.currentShares || '0'
        return (
          <TableCell className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-legend">{formatPercentage(Number(currentSharePercent))}</span>
              <ArrowRight size={14} />
              <span>{formatPercentage(Number(calculatedShare))}</span>
            </div>
          </TableCell>
        )
      
      case 'remove':
        return (
          <TableCell>
            {!readOnly && (
              <button
                onClick={() => removeToken(address)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <XIcon size={16} />
              </button>
            )}
          </TableCell>
        )
      
      default:
        return null
    }
  }

  return (
    <TableRow>
      {columns.map((column) => renderCell(column))}
    </TableRow>
  )
}