import CollapsableBox from 'components/boxes/CollapsableBox'
import SelectableBox from 'components/boxes/SelectableBox'
import TokenLogo from 'components/icons/TokenLogo'
import { Info } from 'components/info-box'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ClaimEmissionMap, Claimable, selectedEmissionsAtom } from '../atoms'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Address } from 'viem'
import { useCallback } from 'react'

const MIN_DOLLAR_VALUE = 10
type Trader = 'backingManager' | 'rsrTrader' | 'rTokenTrader'
const TRADERS: Trader[] = ['backingManager', 'rsrTrader', 'rTokenTrader']
const TraderLabels: Record<Trader, string> = {
  backingManager: 'Backing Manager',
  rsrTrader: 'RSR Trader',
  rTokenTrader: 'RToken Trader',
}

interface ClaimProps extends BoxProps {
  data: Claimable
}

const updateClaimEmissionAtom = atom(
  null,
  (get, set, [erc20, traders]: [Address, Partial<ClaimEmissionMap>]) => {
    const selected = get(selectedEmissionsAtom)
    const availableTraders: ClaimEmissionMap = selected[erc20] || {
      backingManager: false,
      rsrTrader: false,
      rTokenTrader: false,
    }
    const newState = { ...availableTraders, ...traders }

    console.log('traders', traders)

    // Unselected
    if (
      selected[erc20] &&
      !newState.backingManager &&
      !newState.rTokenTrader &&
      !newState.rsrTrader
    ) {
      delete selected[erc20]
    } else {
      selected[erc20] = newState
    }

    set(selectedEmissionsAtom, { ...selected })
  }
)

const ClaimItem = ({ data, ...props }: ClaimProps) => {
  const updateClaimEmissions = useSetAtom(updateClaimEmissionAtom)
  const selected = useAtomValue(selectedEmissionsAtom)

  const handleTokenSelect = useCallback(
    (state: boolean) => {
      // Select asset and traders that are over minDollarValue
      updateClaimEmissions([
        data.asset.address,
        TRADERS.reduce((acc, trader) => {
          acc[trader] = state
            ? data[trader] * data.asset.priceUsd > MIN_DOLLAR_VALUE
            : state
          return acc
        }, {} as ClaimEmissionMap),
      ])
    },
    [updateClaimEmissions]
  )

  const handleTokenTraderSelect = useCallback(
    (trader: Trader, state: boolean) => {
      // Select asset and traders that are over minDollarValue
      updateClaimEmissions([
        data.asset.address,
        {
          [trader]: state,
        },
      ])
    },
    [updateClaimEmissions]
  )

  return (
    <CollapsableBox
      header={
        <SelectableBox
          selected={!!selected[data.asset.address]}
          onSelect={() => handleTokenSelect(!selected[data.asset.address])}
        >
          <Info
            title="Rewards"
            icon={<TokenLogo symbol={data.asset.token.symbol} />}
            subtitle={
              <Box variant="layout.verticalAlign">
                <Text>
                  {formatCurrency(data.amount)} {data.asset.token.symbol}
                </Text>
                <Text ml={2} sx={{ fontSize: 0 }}>
                  (${formatCurrency(data.amountUsd)})
                </Text>
              </Box>
            }
          />
        </SelectableBox>
      }
      mt={3}
      {...props}
    >
      <Box ml="5" mr="20px">
        {TRADERS.map((trader) => {
          if (data[trader] * data.asset.priceUsd < 0.1) {
            return null
          }

          return (
            <SelectableBox
              mb={2}
              key={trader}
              selected={!!selected[data.asset.address]?.[trader]}
              onSelect={() =>
                handleTokenTraderSelect(
                  trader,
                  !selected[data.asset.address]?.[trader]
                )
              }
            >
              <Box sx={{ width: '100%' }} mr={3} variant="layout.verticalAlign">
                <Text>{TraderLabels[trader]}</Text>
                <Text ml="auto" variant="strong" sx={{ fontSize: 1 }}>
                  ${formatCurrency(data[trader] * data.asset.priceUsd)}
                </Text>
              </Box>
            </SelectableBox>
          )
        })}
      </Box>
    </CollapsableBox>
  )
}

export default ClaimItem
