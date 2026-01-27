import TabMenu from 'components/tab-menu'
import { Minus, Plus } from 'lucide-react'
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
    <div className="flex items-center justify-between">
      <TabMenu
        active={operation}
        items={backingOptions}
        small
        background="border"
        onMenuChange={setOperation}
      />
      <div className="flex items-center gap-2">
        <ZapRefreshButton />
        <ZapSettings />
      </div>
    </div>
  )
}

export default ZapTabs
