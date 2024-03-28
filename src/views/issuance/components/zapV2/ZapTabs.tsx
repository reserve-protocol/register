import TabMenu from 'components/tab-menu'
import { Minus, Plus } from 'react-feather'
import { Box } from 'theme-ui'
import { useZap } from './context/ZapContext'
import ZapSettings from './settings/ZapSettings'

const ZapTabs = () => {
  const { operation, setOperation } = useZap()
  const backingOptions = [
    { key: 'mint', label: 'Mint', icon: <Plus size={16} /> },
    { key: 'redeem', label: 'Redeem', icon: <Minus size={16} /> },
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
      <ZapSettings />
    </Box>
  )
}

export default ZapTabs
