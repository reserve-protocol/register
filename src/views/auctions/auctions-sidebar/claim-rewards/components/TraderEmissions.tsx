import { t } from '@lingui/macro'
import CollapsableBox from 'components/boxes/CollapsableBox'
import SelectableBox from 'components/boxes/SelectableBox'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import { Trader } from 'types'
import { formatCurrency } from 'utils'
import { TRADERS, TraderLabels } from 'utils/constants'
import { Address } from 'viem'
import { traderRewardsAtom } from '../atoms'
import ClaimFromTraderButton from './ClaimFromTraderButton'

const MIN_DOLLAR_VALUE = 10

interface Props extends BoxProps {
  trader: Trader
}

const TraderIcon = ({ trader }: { trader: Trader }) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      div: {
        height: '16px',
        width: '4px',
        ':first-of-type': {
          borderTopLeftRadius: '2px',
          borderBottomLeftRadius: '2px',
          marginRight: '2px',
        },
        ':last-of-type': {
          borderTopRightRadius: '2px',
          borderBottomRightRadius: '2px',
          marginLeft: '2px',
        },
      },
    }}
  >
    {TRADERS.map((currentTrader) => (
      <Box
        key={currentTrader}
        sx={{
          backgroundColor: currentTrader === trader ? 'primary' : 'disabled',
        }}
      />
    ))}
  </Box>
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
  <SelectableBox
    selected={selected}
    onSelect={onSelect}
    unavailable={disabled}
    unavailableComponent={<Box />}
  >
    <Box variant="layout.verticalAlign" py={3} sx={{ width: '100%' }} mr={2}>
      <TraderIcon trader={trader} />
      <Text ml={3}>{TraderLabels[trader]}</Text>
      <Text
        ml="auto"
        sx={{
          color: selected ? 'rBlue' : 'text',
          textDecoration: disabled ? 'line-through' : 'none',
        }}
      >
        ${formatCurrency(amount)}
      </Text>
    </Box>
  </SelectableBox>
)

const TraderEmissions = ({ trader, ...props }: Props) => {
  const availableRewards = useAtomValue(traderRewardsAtom)
  const [selected, setSelected] = useState<Address[]>([])
  const [isOpen, setOpen] = useState(false)
  const noBalance = availableRewards[trader].total < 0.01

  const handleSelect = (address: Address) => {
    const index = selected.indexOf(address)

    if (index !== -1) {
      setSelected([...selected.slice(0, index), ...selected.slice(index + 1)])
    } else {
      setSelected([...selected, address])
    }
  }

  const handleSelectAll = () => {
    // Unselect all
    if (selected.length) {
      setOpen(false)
      setSelected([])
    } else {
      setOpen(true)
      const tokens: Address[] = []

      for (const erc20 of availableRewards?.[trader].tokens ?? []) {
        if (erc20.amount > MIN_DOLLAR_VALUE) {
          tokens.push(erc20.address)
        }
      }

      if (tokens.length) {
        setSelected(tokens)
      } else {
        // In case there are no rewards over
        setSelected([
          ...(availableRewards?.[trader].tokens ?? []).map((t) => t.address),
        ])
      }
    }
  }

  return (
    <CollapsableBox
      open={isOpen}
      onToggle={setOpen}
      mt={3}
      header={
        <TraderHeading
          onSelect={handleSelectAll}
          trader={trader}
          selected={!!selected.length}
          amount={availableRewards[trader].total}
          disabled={noBalance}
        />
      }
    >
      {availableRewards[trader].tokens.map((erc20) => {
        const isSelected = selected.includes(erc20.address)
        const isBelowMin = erc20.amount < MIN_DOLLAR_VALUE

        const amountColor = isBelowMin
          ? 'secondaryText'
          : isSelected
          ? 'rBlue'
          : 'text'

        return (
          <SelectableBox
            key={`${trader}-${erc20.symbol}`}
            unavailable={noBalance || erc20.amount < 1}
            selected={isSelected}
            onSelect={() => handleSelect(erc20.address)}
          >
            <Box
              variant="layout.verticalAlign"
              py={3}
              sx={{ width: '100%' }}
              mr={2}
            >
              <TokenLogo symbol={erc20.symbol} />
              <Text ml={3} mr="auto">
                {erc20.symbol}
              </Text>
              {isBelowMin && (
                <Help
                  content={t`The amount of assets selected affects the gas price, this asset may not be worth claiming yet.`}
                />
              )}
              <Text
                ml="2"
                sx={{
                  color: amountColor,
                  textDecoration: isBelowMin ? 'line-through' : 'none',
                }}
              >
                ${formatCurrency(erc20.amount)}
              </Text>
            </Box>
          </SelectableBox>
        )
      })}
      <ClaimFromTraderButton trader={trader} erc20s={selected} />
      <Divider mx={-4} />
    </CollapsableBox>
  )
}

export default TraderEmissions
