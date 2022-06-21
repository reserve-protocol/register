import { t, Trans } from '@lingui/macro'
import { TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import { useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { Box, Divider, Flex, Text } from 'theme-ui'
import { Basket, basketAtom } from '../atoms'
import UnitBasket from './UnitBasket'

interface Props {
  onAdd?(
    data: {
      basket: 'primary' | 'backup'
      targetUnit?: string
    } | null
  ): void
  readOnly?: boolean
}

const getBasketComposition = (basket: Basket) => {
  return Object.keys(basket)
    .reduce((acc, unit) => {
      return `${acc} + ${basket[unit].scale} ${unit}`
    }, '')
    .substring(2)
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

/**
 * View: Deploy -> Basket setup
 * Display primary basket (per target unit) and token composition
 */
const PrimaryBasket = ({ onAdd = () => {}, readOnly = false }: Props) => {
  const { watch } = useFormContext()
  const ticker = watch('ticker') || 'RToken'
  const basket = useAtomValue(basketAtom)
  const units = Object.keys(basket)

  return (
    <TitleCard
      sx={(theme: any) => ({
        height: 'fit-content',
        opacity: units.length ? 70 : 100,
      })}
      title={t`Primary basket`}
      right={
        !readOnly && (
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
        )
      }
    >
      {!units.length && <Placeholder />}
      {!!units.length && (
        <Flex>
          <Text>1 {ticker} =</Text>
          <Text ml="auto">{getBasketComposition(basket)}</Text>
        </Flex>
      )}
      {units.map((targetUnit) => (
        <UnitBasket
          mt={3}
          readOnly={readOnly}
          key={targetUnit}
          data={basket[targetUnit]}
          unit={targetUnit}
        />
      ))}
    </TitleCard>
  )
}

export default PrimaryBasket
