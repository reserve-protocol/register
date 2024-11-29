import TabMenu from 'components/tab-menu'
import { Minus, Plus } from 'react-feather'
import { Box } from 'theme-ui'
import { useZap } from './context/ZapContext'
import ZapSettings from './settings/ZapSettings'
import ZapRefreshButton from './refresh/ZapRefreshButton'

const ZapTabs = () => {
  const { operation, setOperation, zapToYieldPosition } = useZap()
  const backingOptions = [
    ...(zapToYieldPosition
      ? [{ key: 'mint', label: 'Deposit', icon: <Plus size={16} /> }]
      : [
          { key: 'mint', label: 'Mint', icon: <Plus size={16} /> },
          { key: 'redeem', label: 'Redeem', icon: <Minus size={16} /> },
        ]),
  ]

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ justifyContent: 'space-between' }}
    >
      <TabMenu
        active={operation}
        items={backingOptions}
        small
        background="border"
        onMenuChange={setOperation}
      />
      <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
        <ZapRefreshButton />
        <ZapSettings />
      </Box>
    </Box>
  )
}

export default ZapTabs
