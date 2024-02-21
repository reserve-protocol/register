import { Trans } from '@lingui/macro'
import CircleIcon from 'components/icons/CircleIcon'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import EarnIcon from 'components/icons/EarnIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import { atom, useAtomValue } from 'jotai'
import {
  estimatedApyAtom,
  rTokenAtom,
  rTokenBackingDistributionAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { Box, Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import CollateralsChart from './CollateralsChart'

// TODO: TARGET PEG PRICE (ETH+)
const backingOverviewAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const distribution = get(rTokenBackingDistributionAtom)
  const price = get(rTokenPriceAtom)
  const apys = get(estimatedApyAtom)

  return {
    symbol: rToken?.symbol ?? '',
    backing: distribution?.backing ?? 0,
    staked: distribution?.staked ?? 0,
    yield: apys.basket,
    price: price,
  }
})

const BackingOverview = ({ current }: { current: string }) => {
  const data = useAtomValue(backingOverviewAtom)

  return (
    <Card
      variant="inner"
      mr={3}
      p={4}
      mt={[3, 3, 3, 0]}
      sx={{
        flexDirection: 'column',
        width: ['100%', '100%', '100%', 256],
        height: ['fit-content', 'fit-content', 'fit-content', 360],
        flexShrink: '0',
        fontSize: [1, 2, 2, 1],
        // justifyContent: 'center',
      }}
    >
      <Box variant="layout.verticalAlign">
        <EarnNavIcon fontSize={16} />
        <Text ml="2">1 {data.symbol}</Text>
        <Text ml="auto" variant="strong">
          ${formatCurrency(data?.price)}
        </Text>
      </Box>
      <Box mt="2" variant="layout.verticalAlign">
        <EarnIcon color="currentColor" />
        <Text ml="2">Blended Yield</Text>
        <Text ml="auto" variant="strong">
          {data.yield.toFixed(2)}%
        </Text>
      </Box>
      <Box sx={{ display: ['none', 'none', 'none', 'block'] }}>
        <CollateralsChart />
      </Box>
      <Box mt={[2, 2, 2, 0]} variant="layout.verticalAlign">
        <CircleIcon color="currentColor" />
        <Text ml="2">
          <Trans>Backing</Trans>
        </Text>
        <Text ml="auto" variant="strong">
          {data.backing.toFixed(0)}%
        </Text>
      </Box>
      <Box mt="2" variant="layout.verticalAlign">
        <CollaterizationIcon fontSize={16} />
        <Text ml="2">Staked RSR</Text>
        <Text ml="auto" variant="strong">
          {data.staked.toFixed(0)}%
        </Text>
      </Box>
    </Card>
  )
}

export default BackingOverview
