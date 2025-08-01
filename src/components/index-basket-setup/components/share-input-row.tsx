import { TableCell, TableRow } from '@/components/ui/table'
import { NumericalInput } from '@/components/ui/input'
import TokenLogo from '@/components/token-logo'
import { formatPercentage } from '@/utils'
import { XIcon } from 'lucide-react'
import { BasketItem } from '../atoms'
import { ColumnType } from '../basket-table'
import { useBasketSetup } from '../hooks/use-basket-setup'

interface ShareInputRowProps {
  item: BasketItem
  columns: ColumnType[]
  readOnly?: boolean
}

export const ShareInputRow = ({ item, columns, readOnly }: ShareInputRowProps) => {
  const { proposedShares, updateProposedValue, removeToken, allocations } = useBasketSetup()
  const address = item.token.address.toLowerCase()
  const currentShare = item.currentValue
  const proposedShare = proposedShares[address] || currentShare || '0'
  const allocation = allocations[address] || proposedShare

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
          <TableCell className="text-center">
            {formatPercentage(Number(currentShare))}
          </TableCell>
        )
      
      case 'input':
        return (
          <TableCell className="bg-primary/10 w-10">
            <NumericalInput
              placeholder="0%"
              className="min-w-24 w-full text-center"
              value={proposedShare}
              onChange={(value) => updateProposedValue(address, value)}
              disabled={readOnly}
            />
          </TableCell>
        )
      
      case 'delta':
        const delta = Number(proposedShare) - Number(currentShare)
        return (
          <TableCell className="text-center">
            <span className={delta > 0 ? 'text-green-500' : delta < 0 ? 'text-red-500' : ''}>
              {delta > 0 ? '+' : ''}{formatPercentage(delta)}
            </span>
          </TableCell>
        )
      
      case 'allocation':
        return (
          <TableCell className="text-center">
            {formatPercentage(Number(allocation))}
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