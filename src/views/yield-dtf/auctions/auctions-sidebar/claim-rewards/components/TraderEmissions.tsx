import { t } from '@lingui/macro'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Trader } from 'types'
import { formatCurrency } from 'utils'
import { TRADERS, TraderLabels } from 'utils/constants'
import { traderRewardsAtom } from '../atoms'
import { RewardTokenWithCollaterals } from '../types'
import ClaimFromTraderButton from './ClaimFromTraderButton'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

const MIN_DOLLAR_VALUE = 10

interface Props {
  trader: Trader
  className?: string
}

const TraderIcon = ({ trader }: { trader: Trader }) => (
  <div className="flex items-center [&>div]:h-4 [&>div]:w-1 [&>div:first-of-type]:rounded-l-sm [&>div:first-of-type]:mr-0.5 [&>div:last-of-type]:rounded-r-sm [&>div:last-of-type]:ml-0.5">
    {TRADERS.map((currentTrader) => (
      <div
        key={currentTrader}
        className={cn(
          currentTrader === trader ? 'bg-primary' : 'bg-muted'
        )}
      />
    ))}
  </div>
)

const TraderHeading = ({
  trader,
  selected,
  onSelect,
  amount,
  disabled,
}: {
  amount: number
  trader: Trader
  onSelect(): void
  selected: boolean
  disabled?: boolean
}) => (
  <div className="flex items-center w-full">
    <div className="flex items-center py-4 w-full mr-2">
      <TraderIcon trader={trader} />
      <span className="ml-4">{TraderLabels[trader]}</span>
      <span
        className={cn(
          'ml-auto',
          selected ? 'text-primary' : 'text-foreground',
          disabled && 'line-through'
        )}
      >
        ${formatCurrency(amount)}
      </span>
    </div>
    <div className="ml-auto flex items-center">
      {!disabled && (
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelect()}
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer"
        />
      )}
    </div>
  </div>
)

const TraderEmissions = ({ trader, className }: Props) => {
  const availableRewards = useAtomValue(traderRewardsAtom)
  const [selected, setSelected] = useState<RewardTokenWithCollaterals[]>([])
  const [isOpen, setOpen] = useState(false)
  const noBalance = availableRewards[trader].total < 0.01

  const handleSelect = (erc20: RewardTokenWithCollaterals) => {
    const index = selected.findIndex((t) => t.address === erc20.address)

    if (index !== -1) {
      setSelected([...selected.slice(0, index), ...selected.slice(index + 1)])
    } else {
      setSelected([...selected, erc20])
    }
  }

  const handleSelectAll = () => {
    // Unselect all
    if (selected.length) {
      setOpen(false)
      setSelected([])
    } else {
      setOpen(true)
      const tokens: RewardTokenWithCollaterals[] = []

      for (const erc20 of availableRewards?.[trader].tokens ?? []) {
        if (erc20.amount > MIN_DOLLAR_VALUE) {
          tokens.push(erc20)
        }
      }

      if (tokens.length) {
        setSelected(tokens)
      } else {
        // In case there are no rewards over
        setSelected([...(availableRewards?.[trader].tokens ?? [])])
      }
    }
  }

  return (
    <div className={cn('mt-4', className)}>
      {/* CollapsableBox header */}
      <div
        className="flex items-center cursor-pointer w-full"
        onClick={() => setOpen(!isOpen)}
      >
        <div className="w-full">
          <TraderHeading
            onSelect={handleSelectAll}
            trader={trader}
            selected={!!selected.length}
            amount={availableRewards[trader].total}
            disabled={noBalance}
          />
        </div>
        <div className="flex items-center ml-auto">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Collapsible content */}
      {isOpen && (
        <>
          <div className="border-t border-border my-4 -mx-6" />
          {availableRewards[trader].tokens.map((erc20) => {
            const isSelected = !!selected.find((t) => t.address === erc20.address)
            const isBelowMin = erc20.amount < MIN_DOLLAR_VALUE
            const unavailable = noBalance || erc20.amount < 1

            return (
              <div
                key={`${trader}-${erc20.symbol}`}
                className="flex items-center w-full"
              >
                <div className="flex items-center py-4 w-full mr-2">
                  <TokenLogo symbol={erc20.symbol} />
                  <span className="ml-4 mr-auto">{erc20.symbol}</span>
                  {isBelowMin && (
                    <Help
                      content={t`The amount of assets selected affects the gas price, this asset may not be worth claiming yet.`}
                    />
                  )}
                  <span
                    className={cn(
                      'ml-2',
                      isBelowMin
                        ? 'text-muted-foreground'
                        : isSelected
                          ? 'text-primary'
                          : 'text-foreground',
                      isBelowMin && 'line-through'
                    )}
                  >
                    ${formatCurrency(erc20.amount)}
                  </span>
                </div>
                <div className="ml-auto flex items-center">
                  {!unavailable && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelect(erc20)}
                      className="cursor-pointer"
                    />
                  )}
                </div>
              </div>
            )
          })}
          <ClaimFromTraderButton trader={trader} erc20s={selected} />
          <div className="border-t border-border -mx-6" />
        </>
      )}
    </div>
  )
}

export default TraderEmissions
