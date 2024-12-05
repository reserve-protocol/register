import { t, Trans } from '@lingui/macro'
import { NumericalInput } from 'components'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { X } from 'react-feather'
import { Box, CardProps, Divider, Flex, IconButton, Text } from 'theme-ui'
import { formatCurrency, truncateDecimals } from 'utils'
import {
  basketTargetUnitPriceAtom,
  PrimaryUnitBasket,
  updateBasketUnitAtom,
} from '../atoms'
import { collateralDisplay } from 'utils/constants'
import Skeleton from 'react-loading-skeleton'

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
  const updateBasket = useSetAtom(updateBasketUnitAtom)
  const targetUnitPrice = useAtomValue(basketTargetUnitPriceAtom)[unit]

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
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      {!readOnly && (
        <>
          <Flex
            sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}
            mb={3}
            mt={4}
          >
            <Text variant="title">
              {unit} <Trans>Basket</Trans>
            </Text>
            <Flex sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 64 }} mr={3}>
                <NumericalInput
                  variant={+data.scale > 0 ? 'smallInput' : 'inputError'}
                  value={data.scale}
                  sx={{ textAlign: 'center' }}
                  onChange={handleScale}
                />
              </Box>
              <Box>
                <Text mr={2}>{unit}</Text>
                {targetUnitPrice ? (
                  <Text variant="legend" sx={{ display: 'block', fontSize: 1 }}>
                    1 = {formatCurrency(targetUnitPrice)}$
                  </Text>
                ) : (
                  <Skeleton />
                )}
              </Box>
              <Help
                content={t`Basket scale for this unit of account. This is used to initially calculate how much of each token is required for minting.`}
              />
            </Flex>
          </Flex>
          <Flex variant="layout.verticalAlign">
            <Text variant="contentTitle">
              <Trans>{unit} Token distribution</Trans>
            </Text>
            <Text
              ml="auto"
              sx={{
                color: totalDistribution !== 100 ? 'danger' : 'text',
                fontSize: 1,
              }}
            >
              Filled: {totalDistribution}%
            </Text>
          </Flex>
        </>
      )}
      {data.collaterals.map((collateral, index) => (
        <Flex key={collateral.address} variant="layout.verticalAlign" mt={3}>
          <IconInfo
            icon={<TokenLogo width={18} symbol={collateral.symbol} />}
            title={unit}
            help={`Collateral Address: ${collateral.address}`}
            text={
              readOnly
                ? collateralDisplay[collateral.symbol.toLowerCase()] ||
                  collateral.symbol
                : `${getCollateralDist(index)} in ${
                    collateralDisplay[collateral.symbol.toLowerCase()] ||
                    collateral.symbol
                  }`
            }
          />
          {!readOnly ? (
            <Box ml="auto" sx={{ width: 80 }} mr={2}>
              <NumericalInput
                sx={{ textAlign: 'center', padding: '6px', paddingLeft: '6px' }}
                variant={
                  +data.distribution[index] > 0 &&
                  +data.distribution[index] <= 100
                    ? 'smallInput'
                    : 'inputError'
                }
                value={data.distribution[index]}
                disabled={data.collaterals.length > 1 ? false : true}
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
