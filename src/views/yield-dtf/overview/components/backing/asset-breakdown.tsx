import { useLingui } from '@lingui/react/macro'
import CirclesIcon from 'components/icons/CirclesIcon'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import LayersIcon from 'components/icons/LayersIcon'
import RiskIcon from 'components/icons/RiskIcon'
import TabMenu from 'components/tab-menu'
import { useCallback, useMemo, useState } from 'react'
import BackingOverview from './backing-overview'
import CollateralExposure from './collateral-exposure'
import PlatformExposure from './platform-exposure'
import Risks from './risks'
import TokenExposure from './token-exposure'

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
  const { t } = useLingui()
  const items = useMemo(
    () => [
      {
        key: 'collaterals',
        label: t`Collaterals`,
        icon: <CollaterizationIcon />,
      },
      {
        key: 'tokens',
        label: t`Tokens`,
        icon: <CirclesIcon color="currentColor" />,
      },
      { key: 'platforms', label: t`Platforms`, icon: <LayersIcon /> },
      { key: 'risks', label: t`Other Risks`, icon: <RiskIcon /> },
    ],
    [t]
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
    <div className="px-1 pt-1 pb-1 bg-secondary rounded-3xl">
      <div className="p-4 flex items-center">
        <Menu current={current} onChange={handleChange} />
      </div>
      <div className="mt-1 flex flex-wrap-reverse gap-1 w-full xl:flex-nowrap">
        <BackingOverview current={current} />
        <Current />
      </div>
    </div>
  )
}

export default AssetBreakdown
