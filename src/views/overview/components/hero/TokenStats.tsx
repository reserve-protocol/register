import { Trans } from '@lingui/macro'
import StakedIcon from 'components/icons/StakedIcon'
import { atom, useAtomValue } from 'jotai'
import { rTokenPriceAtom, rTokenStateAtom, rsrPriceAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import OverviewActions from './OverviewActions'

const rTokenOverviewAtom = atom((get) => {
  const state = get(rTokenStateAtom)
  const rTokenPrice = get(rTokenPriceAtom)
  const rsrPrice = get(rsrPriceAtom)

  if (!rTokenPrice || !rsrPrice) {
    return null
  }

  return {
    supply: state.tokenSupply * rTokenPrice,
    staked: state.stTokenSupply * rsrPrice,
  }
})

const TokenMetrics = () => {
  const data = useAtomValue(rTokenOverviewAtom)

  return (
    <>
      <Text sx={{ display: 'block' }}>
        <Trans>Total Market Cap</Trans>
      </Text>

      <Text variant="accent" as="h1" sx={{ fontSize: 6 }}>
        ${formatCurrency(data?.supply ?? 0, 0)}
      </Text>
      <Box variant="layout.verticalAlign">
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
