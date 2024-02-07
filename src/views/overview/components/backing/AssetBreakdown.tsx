import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import TabMenu from 'components/tab-menu'
import { useCallback, useMemo, useState } from 'react'
import { Box, Card, Flex } from 'theme-ui'
import CollateralExposure from './CollateralExposure'
import TokenExposure from './TokenExposure'
import PlatformExposure from './PlatformExposure'
import Risks from './Risks'

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
      { key: 'tokens', label: 'Backing', icon: <CollaterizationIcon /> },
      { key: 'platforms', label: 'Rewards', icon: <CollaterizationIcon /> },
      { key: 'risks', label: 'Other Risks', icon: <CollaterizationIcon /> },
    ],
    []
  )

  return <TabMenu active={current} items={items} onMenuChange={onChange} />
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
      <Flex mt={3}>
        <Card
          variant="inner"
          mr={3}
          sx={{
            display: ['none', 'none', 'none', 'flex'],
            width: 256,
            height: 360,
            flexShrink: '0',
          }}
        />
        <Current />
      </Flex>
    </Card>
  )
}

export default AssetBreakdown
