import { Trans } from '@lingui/macro'
import OverviewIcon from 'components/icons/OverviewIcon'
import TokenItem from 'components/token-item'
import { useChainlinkPrices } from 'hooks/useChainlinkPrices'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Flex, Spinner, Text } from 'theme-ui'
import { BigNumberMap, Token } from 'types'
import { getAddress } from 'viem'
import CollateralValue from './CollateralValue'

interface Props extends BoxProps {
  collaterals: Token[]
  quantities: BigNumberMap | null
  prices?: (number | undefined)[]
}

const CollateralDistribution = ({
  collaterals,
  quantities,
  prices,
  sx = {},
  ...props
}: Props) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'inputBorder',
        borderRadius: '6px',
      }}
      px={2}
      py={3}
      {...props}
    >
      <Flex
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
          ...sx,
        }}
        onClick={() => setVisible(!isVisible)}
      >
        <OverviewIcon />
        <Text ml={2}>
          <Trans>Collateral distribution</Trans>
        </Text>
        <Box mx="auto" />
        {isVisible ? <ChevronUp /> : <ChevronDown />}
      </Flex>
      {isVisible && (
        <Box>
          <Divider mx={-2} />
          {collaterals.map((collateral, i) => (
            <Box
              key={collateral.address}
              variant="layout.verticalAlign"
              mt={2}
              sx={{ justifyContent: 'space-between' }}
            >
              <Box>
                <TokenItem symbol={collateral.symbol} />
              </Box>
              {quantities && quantities[getAddress(collateral.address)] ? (
                <CollateralValue
                  quantity={quantities[getAddress(collateral.address)]}
                  decimals={collateral.decimals}
                  price={prices?.[i]}
                />
              ) : (
                <Spinner color="black" size={14} />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default CollateralDistribution
