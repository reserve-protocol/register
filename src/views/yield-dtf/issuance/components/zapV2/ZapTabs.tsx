import TabMenu from 'components/tab-menu'
import { Minus, Plus } from 'lucide-react'
import { Box } from 'theme-ui'
import { useZap } from './context/ZapContext'
import ZapSettings from './settings/ZapSettings'
import ZapRefreshButton from './refresh/ZapRefreshButton'
import { ChainId } from '@/utils/chains'
import { useEffect, useMemo } from 'react'

const ZapTabs = () => {
  const { chainId, operation, setOperation } = useZap()
  const backingOptions = useMemo(() => {
    return [
      ...(chainId !== ChainId.Arbitrum
        ? [{ key: 'mint', label: 'Mint', icon: <Plus size={16} /> }]
        : []),
      { key: 'redeem', label: 'Redeem', icon: <Minus size={16} /> },
    ]
  }, [chainId])

  useEffect(() => {
    if (chainId === ChainId.Arbitrum) {
      setOperation('redeem')
    }
  }, [chainId])

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
