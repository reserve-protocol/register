import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { useAtomValue } from 'jotai'
import { Box, Divider, Flex, Text } from 'theme-ui'
import { truncateDecimals } from 'utils'
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
      return `${acc} + ${truncateDecimals(+basket[unit].scale, 5)} ${unit}`
    }, '')
    .substring(2)
}

const Placeholder = () => (
  <Box
    sx={{ textAlign: 'center', maxWidth: 400, margin: 'auto' }}
    mt={5}
    py={6}
  >
    <EmptyBoxIcon />
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>Empty Basket</Trans>
    </Text>
    <Text variant="legend" sx={{ fontSize: 1, display: 'block' }} mb={2}>
      <Trans>
        The basket & weights of the collateral for your RToken will populate
        here.
      </Trans>
    </Text>
    <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
      <Trans>Want more than one target unit? That’s possible!</Trans>
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
            <Trans>Add token plugin</Trans>
          </SmallButton>
        )}
      </Flex>
      <Divider my={4} />
      <Flex>
        <Text sx={{ width: 140 }}>1 [RToken] =</Text>
        <Text ml="auto">
          {!!units.length ? getBasketComposition(basket) : '--'}
        </Text>
      </Flex>
      <Divider mt={4} />
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
