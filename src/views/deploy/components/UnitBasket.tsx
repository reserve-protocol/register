import { Trans } from '@lingui/macro'
import { Input } from 'components'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import { useMemo } from 'react'
import { X } from 'react-feather'
import { Box, Card, CardProps, Divider, Flex, IconButton, Text } from 'theme-ui'
import { PrimaryUnitBasket } from '../atoms'

interface UnitBasketProps extends CardProps {
  data: PrimaryUnitBasket
  unit: string
}

const UnitBasket = ({ data, unit, ...props }: UnitBasketProps) => {
  const totalDistribution = useMemo(
    () => data.distribution.reduce((count, n) => count + n, 0),
    [data.distribution]
  )
  const getCollateralDist = (index: number) => {
    return ((data.scale * data.distribution[index]) / 100).toFixed(2)
  }
  const handleRemove = (index: number) => {}

  const handleDistribution = (index: number, value: string) => {}

  const handleScale = (value: string) => {}

  return (
    <Card {...props}>
      <Flex variant="layout.verticalAlign">
        <Text>
          <Trans>Target unit: {unit}</Trans>
        </Text>
        <Box mx="auto" />
        <Box sx={{ width: 42 }} mr={2}>
          <Input
            value={data.scale}
            sx={{ textAlign: 'center' }}
            onChange={handleScale}
          />
        </Box>
        <Text mr={2}>{unit}</Text>
        <Help content="TODO" />
      </Flex>
      <Divider my={3} mx={-3} />
      <Flex variant="layout.verticalAlign">
        <Text variant="legend" sx={{ fontSize: 1 }}>
          <Trans>Basket</Trans>
        </Text>
        <Box mx="auto" />
        <Text mr={2}>{totalDistribution}%</Text>
        <Help content="TODO" />
      </Flex>
      {data.collaterals.map((collateral, index) => (
        <Flex key={collateral.address} variant="layout.verticalAlign" mt={3}>
          <IconInfo
            icon={<TokenLogo />}
            title={unit}
            text={`${getCollateralDist(index)} in ${collateral.symbol}`}
          />
          <Box mx="auto" />
          <Box sx={{ width: 60 }}>
            <Input
              sx={{ textAlign: 'center' }}
              value={
                +data.distribution[index] > 0
                  ? Math.round(data.distribution[index] * 100) / 100
                  : data.distribution[index]
              }
              onChange={(value) => handleDistribution(index, value)}
            />
          </Box>

          <Text>%</Text>
          <IconButton
            sx={{ cursor: 'pointer' }}
            onClick={() => handleRemove(index)}
          >
            <X size={20} color="var(--theme-ui-colors-secondaryText)" />
          </IconButton>
        </Flex>
      ))}
    </Card>
  )
}

export default UnitBasket
