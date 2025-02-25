import { Trans } from '@lingui/macro'
import GoTo from '@/components/old/button/GoTo'
import TokenItem from 'components/token-item'
import { useAtomValue } from 'jotai'
import { chainIdAtom, rTokenBasketAtom } from 'state/atoms'
import { Box, BoxProps, Card, Text, Divider } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

/**
 * View: Settings > Display RToken primary basket composition
 */
const BasketInfo = (props: BoxProps) => {
  const basket = useAtomValue(rTokenBasketAtom)
  const units = Object.keys(basket)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Card p={4}>
      <Text variant="title">
        <Trans>Primary Basket</Trans>
      </Text>
      {units.map((unit, unitIndex) => (
        <Box key={unit} mt={unitIndex ? 4 : 0}>
          <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
          <Text variant="strong" sx={{ display: 'block' }} mb={3}>
            {unit} <Trans>Basket</Trans>
          </Text>
          {basket[unit].collaterals.map((collateral, index) => (
            <Box
              variant="layout.verticalAlign"
              mt={index ? 3 : 0}
              key={collateral.address}
            >
              <TokenItem width={16} symbol={collateral.symbol} />
              <Text ml="auto">{+basket[unit].distribution[index]}%</Text>
              <GoTo
                ml={3}
                sx={{ flexShrink: 0 }}
                href={getExplorerLink(
                  collateral.address,
                  chainId,
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
