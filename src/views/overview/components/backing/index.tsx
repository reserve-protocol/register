import { Trans } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import { atom, useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { rTokenAtom, rTokenBackingDistributionAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import AssetBreakdown from './AssetBreakdown'
import RevenueSplitOverview from './RevenueSplitOverview'

// TODO: Localization?
const pegsAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const distribution = get(
    rTokenBackingDistributionAtom
  )?.collateralDistribution

  if (!rToken || !distribution) {
    return null
  }

  const unitCount = rToken.collaterals.reduce((acc, collateral) => {
    acc[distribution[collateral.address].targetUnit] =
      acc[distribution[collateral.address].targetUnit] + 1 || 1
    return acc
  }, {} as { [x: string]: number })

  const totalUnits = Object.keys(unitCount).length

  return Object.entries(unitCount).reduce((acc, [unit, count], index) => {
    if (index && index === totalUnits - 1) {
      acc += ' and '
    } else if (index) {
      acc += ', '
    }

    acc += `${count} Collateral${count > 1 ? 's' : ''} pegged to ${unit}`

    return acc
  }, `${rToken.symbol} has `)
})

const BackingResume = () => {
  const legend = useAtomValue(pegsAtom)

  return (
    <Text
      ml="4"
      mt="2"
      mb={5}
      as="h2"
      variant="title"
      sx={{ fontWeight: 'bold' }}
    >
      {legend ? legend : <Skeleton />}
    </Text>
  )
}

const Backing = () => (
  <Box>
    <Box
      variant="layout.verticalAlign"
      ml="4"
      mb={4}
      mt={6}
      sx={{ color: 'accent' }}
    >
      <BasketCubeIcon fontSize={24} />
      <Text ml="2" as="h2" variant="title" sx={{ fontWeight: '400' }}>
        <Trans>Backing & Risk</Trans>
      </Text>
    </Box>
    <Text as="p" ml="4" sx={{ fontSize: 3, maxWidth: 540 }}>
      <Trans>
        RTokens are 100% backed by a diversified set of underlying collateral
        tokens...
      </Trans>
    </Text>
    <BackingResume />
    <AssetBreakdown />
    <RevenueSplitOverview mt="4" />
  </Box>
)

export default Backing
