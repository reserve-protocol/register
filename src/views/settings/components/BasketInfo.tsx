import { Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import TokenItem from 'components/token-item'
import { useAtomValue } from 'jotai'
import { rTokenBasketAtom } from 'state/atoms'
import { Box, BoxProps, Card, Text } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const BasketInfo = (props: BoxProps) => {
  const basket = useAtomValue(rTokenBasketAtom)
  const units = Object.keys(basket)

  return (
    <Card p={4}>
      <Text variant="sectionTitle" mb={5}>
        <Trans>Primary Basket</Trans>
      </Text>
      {units.map((unit, unitIndex) => (
        <Box key={unit} mt={unitIndex ? 4 : 0}>
          <Text variant="legend" sx={{ display: 'block' }} mb={3}>
            {unit} <Trans>Basket</Trans>
          </Text>
          {basket[unit].collaterals.map((collateral, index) => (
            <Box
              variant="layout.verticalAlign"
              mt={index ? 2 : 0}
              key={collateral.address}
            >
              <TokenItem size={14} symbol={collateral.symbol} />
              <Text ml="auto">{+basket[unit].distribution[index]}%</Text>
              <GoTo
                href={getExplorerLink(
                  collateral.address,
                  ExplorerDataType.ADDRESS
                )}
              />
            </Box>
          ))}
        </Box>
      ))}
    </Card>
  )
}

export default BasketInfo
