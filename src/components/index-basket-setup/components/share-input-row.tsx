import { TableCell, TableRow } from '@/components/ui/table'
import { NumericalInput } from '@/components/ui/input'
import TokenLogo from '@/components/token-logo'
import { formatPercentage } from '@/utils'
import { XIcon } from 'lucide-react'
import { BasketItem } from '../atoms'
import { ColumnType } from '../basket-table'
import { useBasketSetup } from '../hooks/use-basket-setup'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/chain/atoms/chainAtoms'
import { cn } from '@/lib/utils'

interface ShareInputRowProps {
  item: BasketItem
  columns: ColumnType[]
  readOnly?: boolean
}

export const ShareInputRow = ({
  item,
  columns,
  readOnly,
}: ShareInputRowProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const { proposedShares, updateProposedValue, removeToken, allocations } =
    useBasketSetup()
  const address = item.token.address.toLowerCase()
  const currentShare = item.currentValue
  const initialProposedShare = item.proposedValue || currentShare
  const proposedShare = proposedShares[address] || currentShare || '0'
  const allocation = allocations[address] || proposedShare
  const hasBeenEdited = proposedShare !== initialProposedShare

  const renderCell = (column: ColumnType) => {
    switch (column) {
      case 'token':
        return (
          <TableCell className="border-r">
            <div className="flex items-center gap-2">
              <TokenLogo
                size="xl"
                chain={chainId}
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
              className={cn(
                "min-w-24 w-full text-center",
                hasBeenEdited && "text-primary"
              )}
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
            <span
              className={
                delta > 0 ? 'text-green-500' : delta < 0 ? 'text-red-500' : ''
              }
            >
              {delta > 0 ? '+' : ''}
              {formatPercentage(delta)}
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
    <TableRow className={cn(hasBeenEdited && "border-l-4 border-l-primary")}>
      {columns.map((column) => renderCell(column))}
    </TableRow>
  )
}
