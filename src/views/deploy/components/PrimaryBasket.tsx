import { t, Trans } from '@lingui/macro'
import { Input, TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { X } from 'react-feather'
import { Box, Card, CardProps, Divider, Flex, IconButton, Text } from 'theme-ui'
import { basketAtom, PrimaryUnitBasket } from '../atoms'

interface Props extends CardProps {
  onAdd(
    data: {
      basket: 'primary' | 'backup'
      targetUnit?: string
    } | null
  ): void
}

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
        <Box sx={{ width: 40 }} mr={2}>
          <Input value={data.scale} onChange={handleScale} />
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

const Placeholder = () => (
  <Box>
    <Flex variant="layout.verticalAlign">
      <Text py={1}>
        <Trans>Basket</Trans>
      </Text>
      <Box mx="auto" />
      <Text>0%</Text>
      <Help ml={2} content="TODO" />
    </Flex>
    <Divider mx={-4} my={3} />
    <Text variant="legend" sx={{ fontSize: 1 }}>
      <Trans>
        This is the basket & weights you want your RToken to use as it’s primary
        backing.
      </Trans>
    </Text>
  </Box>
)

const PrimaryBasket = ({ onAdd }: Props) => {
  const basket = useAtomValue(basketAtom)
  const units = Object.keys(basket)

  return (
    <TitleCard
      sx={(theme: any) => ({
        height: 'fit-content',
        border: units.length ? `1px solid ${theme.colors.border}` : 'none',
        backgroundColor: units.length ? 'transparent' : 'bgCard',
      })}
      title={t`Primary basket`}
      right={
        <Flex variant="layout.verticalAlign">
          <SmallButton onClick={() => onAdd({ basket: 'primary' })} mr={2}>
            <Trans>Add</Trans>
          </SmallButton>
          <Help
            content={
              <Text>
                <Trans>TODO: Help copy</Trans>
              </Text>
            }
          />
        </Flex>
      }
    >
      {!units.length && <Placeholder />}
      {units.map((targetUnit) => (
        <UnitBasket
          mt={3}
          key={targetUnit}
          data={basket[targetUnit]}
          unit={targetUnit}
        />
      ))}
    </TitleCard>
  )
}

export default PrimaryBasket
