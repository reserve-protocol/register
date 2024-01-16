import CollapsableBox from 'components/boxes/CollapsableBox'
import SelectableBox from 'components/boxes/SelectableBox'
import TokenLogo from 'components/icons/TokenLogo'
import { Info } from 'components/info-box'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { Box, BoxProps, Text } from 'theme-ui'
import { Trader } from 'types'
import { formatCurrency } from 'utils'
import { TRADERS, TraderLabels } from 'utils/constants'
import { Address } from 'viem'
import { selectedEmissionsAtom } from '../atoms'
import { ClaimEmissionMap, Claimable } from '../types'

const MIN_DOLLAR_VALUE = 10

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
        data.asset.token.address,
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
        data.asset.token.address,
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
          selected={!!selected[data.asset.token.address]}
          onSelect={() =>
            handleTokenSelect(!selected[data.asset.token.address])
          }
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
      <Box ml="36px" mr="20px">
        {TRADERS.map((trader, index) => {
          if (data[trader] * data.asset.priceUsd < 0.1) {
            return null
          }

          return (
            <SelectableBox
              pt={index ? 2 : 0}
              mt={index ? 2 : 0}
              key={trader}
              sx={{
                borderTop: index ? '1px solid' : 'none',
                borderColor: 'border',
              }}
              selected={!!selected[data.asset.token.address]?.[trader]}
              onSelect={() =>
                handleTokenTraderSelect(
                  trader,
                  !selected[data.asset.token.address]?.[trader]
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
