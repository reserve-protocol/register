import { formatUnits } from '@ethersproject/units'
import { getAddress } from '@ethersproject/address'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Package } from 'react-feather'
import { Box, BoxProps, Flex, Text, Divider, Spinner } from 'theme-ui'
import { BigNumberMap, Token } from 'types'
import { formatCurrency } from 'utils'
import { Trans } from '@lingui/macro'
import TokenItem from 'components/token-item'

interface Props extends BoxProps {
  collaterals: Token[]
  quantities: BigNumberMap
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
      sx={{ border: '1px solid', borderColor: 'secondary', borderRadius: 10 }}
      p={2}
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
        <Package size={20} strokeWidth={1} />
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
                {quantities[getAddress(collateral.address)] ? (
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
