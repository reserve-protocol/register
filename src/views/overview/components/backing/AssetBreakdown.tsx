import CirclesIcon from 'components/icons/CirclesIcon'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import LayersIcon from 'components/icons/LayersIcon'
import RiskIcon from 'components/icons/RiskIcon'
import TabMenu from 'components/tab-menu'
import { useCallback, useMemo, useState } from 'react'
import { Box, Card, Flex } from 'theme-ui'
import BackingOverview from './BackingOverview'
import CollateralExposure from './CollateralExposure'
import PlatformExposure from './PlatformExposure'
import Risks from './Risks'
import TokenExposure from './TokenExposure'

const tabComponents = {
  collaterals: CollateralExposure,
  tokens: TokenExposure,
  platforms: PlatformExposure,
  risks: Risks,
}

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
      { key: 'risks', label: 'Other Risks', icon: <RiskIcon /> },
    ],
    []
  )

  return (
    <TabMenu active={current} items={items} collapse onMenuChange={onChange} />
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
    <Card px={[2, 4]} pt={[3, 4]}>
      <Box variant="layout.verticalAlign">
        <Menu current={current} onChange={handleChange} />
      </Box>
      <Flex
        mt={3}
        sx={{
          flexWrap: ['wrap-reverse', 'wrap-reverse', 'wrap-reverse', 'nowrap'],
        }}
      >
        <BackingOverview current={current} />
        <Current />
      </Flex>
    </Card>
  )
}

export default AssetBreakdown
