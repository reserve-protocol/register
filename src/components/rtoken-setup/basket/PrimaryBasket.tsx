import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import Help from 'components/help'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Divider, Flex, Text } from 'theme-ui'
import { truncateDecimals } from 'utils'
import { Basket, basketAtom } from '../atoms'
import UnitBasket from './UnitBasket'

interface Props extends BoxProps {
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
    <Text variant="strong" my={2}>
      <Trans>Empty Basket</Trans>
    </Text>
    <Text variant="legend" as="p" sx={{ fontSize: 1 }} mb={2}>
      <Trans>
        The basket & weights of the collateral for your RToken will populate
        here.
      </Trans>
    </Text>
    <Text variant="legend" as="p" sx={{ fontSize: 1 }}>
      <Trans>Want more than one target unit? That’s possible!</Trans>
    </Text>
  </Box>
)

/**
 * View: Deploy -> Basket setup
 * Display primary basket (per target unit) and token composition
 */
const PrimaryBasket = ({
  onAdd = () => {},
  readOnly = false,
  ...props
}: Props) => {
  const basket = useAtomValue(basketAtom)
  const units = Object.keys(basket)

  return (
    <Box {...props}>
      <Flex variant="layout.verticalAlign">
        <Text variant="sectionTitle">Primary Basket</Text>
        {!readOnly && (
          <SmallButton
            onClick={() => onAdd({ basket: 'primary' })}
            ml="auto"
            variant="primary"
          >
            <Trans>Add to basket</Trans>
          </SmallButton>
        )}
      </Flex>
      {!units.length && <Placeholder />}
      {units.map((targetUnit) => (
        <UnitBasket
          mt={3}
          readOnly={readOnly}
          key={targetUnit}
          data={basket[targetUnit]}
          unit={targetUnit}
        />
      ))}
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <Flex sx={{ justiftContent: 'space-between', alignItems: 'center' }}>
        <Flex mr={'auto'} sx={{ flexDirection: 'column' }}>
          <Text variant="legend">1 Token =</Text>
          <Text variant="title">
            {!!units.length ? getBasketComposition(basket) : '--'}
          </Text>
        </Flex>
        <Help
          ml={2}
          size={14}
          mt="1px"
          content="Total initial RToken scale including all targets. If your RToken only has one target unit this will be the same as the basket scale input."
        />
      </Flex>
    </Box>
  )
}

export default PrimaryBasket
