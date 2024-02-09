import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import TabMenu from 'components/tab-menu'
import { useCallback, useMemo, useState } from 'react'
import { Box, Card, Flex, Text } from 'theme-ui'
import CollateralExposure from './CollateralExposure'
import TokenExposure from './TokenExposure'
import PlatformExposure from './PlatformExposure'
import Risks from './Risks'
import CirclesIcon from 'components/icons/CirclesIcon'
import LayersIcon from 'components/icons/LayersIcon'
import CollateralsChart from './CollateralsChart'
import { atom, useAtom, useAtomValue } from 'jotai'
import {
  estimatedApyAtom,
  rTokenAtom,
  rTokenBackingDistributionAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import { formatCurrency } from 'utils'
import { Trans } from '@lingui/macro'
import CircleIcon from 'components/icons/CircleIcon'
import EarnIcon from 'components/icons/EarnIcon'

const tabComponents = {
  collaterals: CollateralExposure,
  tokens: TokenExposure,
  platforms: PlatformExposure,
  risks: Risks,
}

// const tabCharts = {
//   collaterals: CollateralExposure,
//   tokens: TokenExposure,
//   platforms: PlatformExposure,
//   risks: Risks,
// }

const Menu = ({
  current,
  onChange,
}: {
  current: string
  onChange(key: string): void
}) => {
  const items = useMemo(
    () => [
      {
        key: 'collaterals',
        label: 'Collaterals',
        icon: <CollaterizationIcon />,
      },
      {
        key: 'tokens',
        label: 'Tokens',
        icon: <CirclesIcon color="currentColor" />,
      },
      { key: 'platforms', label: 'Platforms', icon: <LayersIcon /> },
      { key: 'risks', label: 'Other Risks', icon: <CollaterizationIcon /> },
    ],
    []
  )

  return <TabMenu active={current} items={items} onMenuChange={onChange} />
}

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

const BackingOverviewContainer = ({ current }: { current: string }) => {
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
        <CircleIcon color="currentColor" />
        <Text ml="2">
          <Trans>Backing</Trans>
        </Text>
        <Text ml="auto" variant="strong">
          {data.backing.toFixed(0)}%
        </Text>
      </Box>
      <Box sx={{ display: ['none', 'none', 'none', 'block'] }}>
        <CollateralsChart />
      </Box>
      <Box mt={[2, 2, 2, 0]} variant="layout.verticalAlign">
        <CollaterizationIcon fontSize={16} />
        <Text ml="2">Staked RSR</Text>
        <Text ml="auto" variant="strong">
          {data.staked.toFixed(0)}%
        </Text>
      </Box>
      <Box mt="2" variant="layout.verticalAlign">
        <EarnIcon color="currentColor" />
        <Text ml="2">Blended Yield</Text>
        <Text ml="auto" variant="strong">
          {data.yield.toFixed(2)}%
        </Text>
      </Box>
    </Card>
  )
}

const AssetBreakdown = () => {
  const [current, setCurrent] = useState('collaterals')

  const handleChange = useCallback(
    (key: string) => {
      setCurrent(key)
    },
    [setCurrent]
  )

  const Current = tabComponents[current as keyof typeof tabComponents]

  return (
    <Card>
      <Box variant="layout.verticalAlign">
        <Menu current={current} onChange={handleChange} />
      </Box>
      <Flex
        mt={3}
        sx={{
          flexWrap: ['wrap-reverse', 'wrap-reverse', 'wrap-reverse', 'nowrap'],
        }}
      >
        <BackingOverviewContainer current={current} />
        <Current />
      </Flex>
    </Card>
  )
}

export default AssetBreakdown
