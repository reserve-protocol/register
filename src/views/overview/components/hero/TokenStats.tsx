import { Trans } from '@lingui/macro'
import StakedIcon from 'components/icons/StakedIcon'
import { atom, useAtomValue } from 'jotai'
import { rTokenPriceAtom, rTokenStateAtom, rsrPriceAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import OverviewActions from './OverviewActions'
import { rTokenTargetPriceAtom } from 'views/overview/atoms'

const rTokenOverviewAtom = atom((get) => {
  const state = get(rTokenStateAtom)
  const rTokenPrice = get(rTokenPriceAtom)
  const rsrPrice = get(rsrPriceAtom)
  const pegData = get(rTokenTargetPriceAtom)

  if (!rTokenPrice || !rsrPrice) {
    return null
  }

  return {
    supply: state.tokenSupply * rTokenPrice,
    staked: state.stTokenSupply * rsrPrice,
    pegData,
  }
})

const TokenMetrics = () => {
  const data = useAtomValue(rTokenOverviewAtom)

  return (
    <>
      <Text sx={{ display: 'block' }}>
        <Trans>Total Market Cap</Trans>
      </Text>
      {data?.pegData ? (
        <Box sx={{ display: 'flex', alignItems: 'end', flexWrap: 'wrap' }}>
          <Text variant="accent" mr="2" as="h1" sx={{ fontSize: [5, 6] }}>
            {formatCurrency(data.pegData.supply, 0)} {data.pegData.unit}
          </Text>
          <Text
            sx={{ fontSize: [3, 4], display: 'block' }}
            pb={['6px', '12px']}
          >
            (${formatCurrency(data?.supply ?? 0, 0)})
          </Text>
        </Box>
      ) : (
        <Text variant="accent" as="h1" sx={{ fontSize: 6 }}>
          ${formatCurrency(data?.supply ?? 0, 0)}
        </Text>
      )}

      <Box mb={3} mt={2} variant="layout.verticalAlign">
        <StakedIcon />
        <Text ml={2}>
          <Trans>Stake pool USD value:</Trans>
        </Text>
        <Text ml="1" variant="strong">
          ${formatCurrency(data?.staked ?? 0, 0)}
        </Text>
      </Box>
    </>
  )
}

const TokenStats = () => (
  <Box>
    <TokenMetrics />
    <OverviewActions />
  </Box>
)

export default TokenStats
