import { t, Trans } from '@lingui/macro'
import { NumericalInput } from 'components'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import { useUpdateAtom } from 'jotai/utils'
import { useMemo } from 'react'
import { X } from 'react-feather'
import { formatCurrency, truncateDecimals } from 'utils'
import { Box, CardProps, Flex, IconButton, Text } from 'theme-ui'
import { PrimaryUnitBasket, updateBasketUnitAtom } from '../atoms'

interface UnitBasketProps extends CardProps {
  data: PrimaryUnitBasket
  unit: string
  readOnly?: boolean
}

/**
 * View: Deploy -> Basket setup -> PrimaryBasket
 * Display collateral composition for target unit
 */
const UnitBasket = ({ data, readOnly, unit, ...props }: UnitBasketProps) => {
  const updateBasket = useUpdateAtom(updateBasketUnitAtom)

  const totalDistribution = useMemo(
    () => data.distribution.reduce((count, n) => count + Number(n), 0),
    [data.distribution]
  )
  const getCollateralDist = (index: number) => {
    return truncateDecimals((+data.scale * +data.distribution[index]) / 100, 5)
  }

  const handleRemove = (index: number) => {
    const n = data.collaterals.length - 1
    const distribution = new Array(n).fill(100 / n)

    updateBasket([
      unit,
      {
        ...data,
        distribution,
        collaterals: [
          ...data.collaterals.slice(0, index),
          ...data.collaterals.slice(index + 1),
        ],
      },
    ])
  }

  const handleDistribution = (index: number, value: string) => {
    updateBasket([
      unit,
      {
        ...data,
        distribution: [
          ...data.distribution.slice(0, index),
          value,
          ...data.distribution.slice(index + 1),
        ],
      },
    ])
  }

  const handleScale = (scale: string) => {
    updateBasket([unit, { ...data, scale: scale }])
  }

  return (
    <Box {...props}>
      {!readOnly && (
        <>
          <Flex sx={{ justifyContent: 'space-between' }} mb={3} mt={4}>
            <Text sx={{ fontWeight: 500, fontSize: 3 }}>
              {unit} <Trans>Basket</Trans>
            </Text>
            <Flex sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 64 }} mx={3}>
                <NumericalInput
                  variant={+data.scale > 0 ? 'smallInput' : 'inputError'}
                  value={data.scale}
                  sx={{ textAlign: 'center' }}
                  onChange={handleScale}
                />
              </Box>
              <Text mr={2}>{unit}</Text>
              <Help content={t`Target value for this unit of account`} />
            </Flex>
          </Flex>
          <Flex variant="layout.verticalAlign">
            <Text>
              <Trans>{unit} Token distribution</Trans>
            </Text>
            <Text
              ml="auto"
              sx={{ color: totalDistribution !== 100 ? 'danger' : 'text' }}
            >
              ({totalDistribution}%)
            </Text>
          </Flex>
        </>
      )}
      {data.collaterals.map((collateral, index) => (
        <Flex key={collateral.address} variant="layout.verticalAlign" mt={3}>
          <IconInfo
            icon={<TokenLogo size={18} symbol={collateral.symbol} />}
            title={unit}
            text={`${getCollateralDist(index)} in ${collateral.symbol}`}
          />
          {!readOnly ? (
            <Box ml="auto" sx={{ width: 56 }} mr={2}>
              <NumericalInput
                sx={{ textAlign: 'center' }}
                variant={
                  +data.distribution[index] > 0 &&
                  +data.distribution[index] <= 100
                    ? 'smallInput'
                    : 'inputError'
                }
                value={data.distribution[index]}
                onChange={(value) => handleDistribution(index, value)}
              />
            </Box>
          ) : (
            <Text ml="auto">
              {Math.round(+data.distribution[index] * 100) / 100}
            </Text>
          )}

          <Text>%</Text>
          {!readOnly && (
            <IconButton
              ml={2}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleRemove(index)}
            >
              <X size={20} color="var(--theme-ui-colors-lightText)" />
            </IconButton>
          )}
        </Flex>
      ))}
    </Box>
  )
}

export default UnitBasket
