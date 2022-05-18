import { formatUnits } from '@ethersproject/units'
import { getAddress } from '@ethersproject/address'
import { useState } from 'react'
import { ChevronDown, ChevronUp, PieChart } from 'react-feather'
import { Box, BoxProps, Flex, Text, Divider, Spinner } from 'theme-ui'
import { BigNumberMap, ReserveToken } from 'types'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  data: ReserveToken
  quantities: BigNumberMap
}

const CollateralDistribution = ({
  data,
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
        <PieChart size={20} />
        <Text ml={3}>Collateral distribution</Text>
        <Box mx="auto" />
        {isVisible ? <ChevronUp /> : <ChevronDown />}
      </Flex>
      {isVisible && (
        <Box>
          <Divider sx={{ borderColor: '#ccc' }} mx={-2} />
          {data.basket.collaterals.map((collateral) => (
            <Flex key={collateral.id}>
              <Text>{collateral.token.symbol}</Text>
              <Box mx="auto" />
              <Text sx={{ fontWeight: '500' }}>
                {quantities[getAddress(collateral.token.address)] ? (
                  formatCurrency(
                    Number(
                      formatUnits(
                        quantities[getAddress(collateral.token.address)],
                        collateral.token.decimals
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
