import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useAtomValue } from 'jotai'
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

// TODO: Better placeholder
const Placeholder = () => (
  <Box sx={{ textAlign: 'center' }} mt={5}>
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>Empty Basket</Trans>
    </Text>
    <Text variant="legend" sx={{ fontSize: 1 }}>
      <Trans>
        The basket & weights you want your RToken to use as it’s primary
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
  const basket = useAtomValue(basketAtom)
  const units = Object.keys(basket)

  return (
    <Box>
      <Flex variant="layout.verticalAlign">
        <Text variant="title">Primary Basket</Text>
        {!readOnly && (
          <SmallButton onClick={() => onAdd({ basket: 'primary' })} ml="auto">
            <Trans>+ Add</Trans>
          </SmallButton>
        )}
      </Flex>
      <Divider my={3} />
      <Flex>
        <Text>1 [RToken] =</Text>
        <Text ml="auto">
          {!!units.length ? getBasketComposition(basket) : '--'}
        </Text>
      </Flex>
      <Divider mt={3} />
      {!units.length && <Placeholder />}

      {units.map((targetUnit, index) => (
        <UnitBasket
          mt={3}
          readOnly={readOnly}
          key={targetUnit}
          data={basket[targetUnit]}
          unit={targetUnit}
        />
      ))}
    </Box>
  )
}

export default PrimaryBasket
