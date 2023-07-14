import { Trans } from '@lingui/macro'
import OverviewIcon from 'components/icons/OverviewIcon'
import TokenItem from 'components/token-item'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Divider, Flex, Spinner, Text } from 'theme-ui'
import { BigNumberMap, Token } from 'types'
import { formatCurrency } from 'utils'
import { formatUnits, getAddress } from 'viem'

interface Props extends BoxProps {
  collaterals: Token[]
  quantities: BigNumberMap | null
}

const CollateralDistribution = ({
  collaterals,
  quantities,
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
          {collaterals.map((collateral) => (
            <Flex mt={2} key={collateral.address}>
              <TokenItem symbol={collateral.symbol} />
              <Box mx="auto" />
              <Text sx={{ fontWeight: '500' }}>
                {quantities && quantities[getAddress(collateral.address)] ? (
                  formatCurrency(
                    Number(
                      formatUnits(
                        quantities[getAddress(collateral.address)],
                        collateral.decimals
                      )
                    )
                  )
                ) : (
                  <Spinner color="black" size={14} />
                )}
              </Text>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default CollateralDistribution
