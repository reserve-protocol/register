import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React from 'react'
import {
  basketItemsAtom,
  basketModeAtom,
  currentInputTypeAtom,
  proposedSharesAtom,
  isValidAllocationAtom,
  remainingAllocationAtom,
} from './atoms'
import { useBasketSetup } from './hooks/use-basket-setup'
import { ShareInputRow } from './components/share-input-row'
import { UnitInputRow } from './components/unit-input-row'
import { TokenSelector } from './token-selector'
import { formatPercentage } from '@/utils'

export type ColumnType =
  | 'token'
  | 'current'
  | 'input'
  | 'delta'
  | 'allocation'
  | 'remove'

interface BasketTableProps {
  mode?: 'shares' | 'units' | 'both'
  columns?: ColumnType[]
  showToggle?: boolean
  readOnly?: boolean
  showAddToken?: boolean
  className?: string
}

const defaultColumns: ColumnType[] = [
  'token',
  'current',
  'input',
  'allocation',
  'remove',
]

const getColumnLabel = (
  column: ColumnType,
  inputType: 'shares' | 'units'
): string => {
  switch (column) {
    case 'token':
      return 'Token'
    case 'current':
      return inputType === 'units' ? 'Current units' : 'Current %'
    case 'input':
      return inputType === 'units' ? 'New units' : 'New %'
    case 'delta':
      return 'Delta'
    case 'allocation':
      return '% of Basket'
    case 'remove':
      return ''
    default:
      return ''
  }
}

const InputToggle = () => {
  const [currentInputType, setCurrentInputType] = useAtom(currentInputTypeAtom)
  const basketMode = useAtomValue(basketModeAtom)

  if (basketMode === 'shares' || basketMode === 'units') {
    return (
      <span className="font-bold">
        {basketMode === 'shares' ? 'Share %' : 'Units'}
      </span>
    )
  }

  return (
    <ToggleGroup
      type="single"
      className="bg-muted-foreground/10 p-1 rounded-lg justify-start w-max py-1"
      value={currentInputType}
      onValueChange={(value) => {
        if (value) setCurrentInputType(value as 'shares' | 'units')
      }}
    >
      <ToggleGroupItem
        className="px-3 h-8 rounded-md data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
        value="units"
      >
        Unit
      </ToggleGroupItem>
      <ToggleGroupItem
        className="px-3 h-8 rounded-md data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
        value="shares"
      >
        Share
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

const EvenDistributionButton = () => {
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

const RemainingAllocation = () => {
  const remainingAllocation = useAtomValue(remainingAllocationAtom)
  const isValid = useAtomValue(isValidAllocationAtom)

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

export const BasketTable = ({
  mode,
  columns = defaultColumns,
  showToggle = true,
  readOnly = false,
  showAddToken = true,
  className,
}: BasketTableProps) => {
  const basketItems = useAtomValue(basketItemsAtom)
  const basketMode = useAtomValue(basketModeAtom)
  const currentInputType = useAtomValue(currentInputTypeAtom)
  const { addTokens } = useBasketSetup()

  // Override mode if specified
  const effectiveMode = mode || basketMode
  const effectiveInputType =
    effectiveMode === 'both'
      ? currentInputType
      : effectiveMode === 'units'
        ? 'units'
        : 'shares'

  const items = Object.values(basketItems)

  if (items.length === 0) {
    return (
      <div className="border rounded-xl p-8 text-center text-muted-foreground">
        <p>No tokens in basket</p>
        {showAddToken && (
          <p className="text-sm mt-2">Add tokens to get started</p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('overflow-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className={cn(
                  column === 'token' && 'border-r min-w-48',
                  column === 'current' &&
                    effectiveInputType === 'units' &&
                    'text-right w-36',
                  column === 'current' &&
                    effectiveInputType === 'shares' &&
                    'w-16 text-center',
                  column === 'input' &&
                    'bg-primary/10 text-primary text-center font-bold',
                  column === 'delta' && 'text-center',
                  column === 'allocation' &&
                    effectiveInputType === 'units' &&
                    'text-center',
                  column === 'allocation' &&
                    effectiveInputType === 'shares' &&
                    'w-16 text-center',
                  column === 'remove' && 'w-12'
                )}
              >
                {column === 'input' &&
                showToggle &&
                effectiveMode === 'both' ? (
                  <InputToggle />
                ) : (
                  getColumnLabel(column, effectiveInputType)
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const RowComponent =
              effectiveInputType === 'units' ? UnitInputRow : ShareInputRow
            return (
              <RowComponent
                key={item.token.address}
                item={item}
                columns={columns}
                readOnly={readOnly}
              />
            )
          })}
          {/* Footer row with controls */}
          {showAddToken && effectiveInputType === 'shares' && (
            <TableRow className="hover:bg-card">
              <TableCell colSpan={columns.length}>
                <div className="flex justify-between items-center">
                  <TokenSelector />
                  <div className="flex flex-col gap-2">
                    <EvenDistributionButton />
                    <RemainingAllocation />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
