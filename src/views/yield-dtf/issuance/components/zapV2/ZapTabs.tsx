import { isInactiveDTF, useDTFStatus } from '@/hooks/use-dtf-status'
import TabMenu from 'components/tab-menu'
import useRToken from 'hooks/useRToken'
import { Minus, Plus } from 'lucide-react'
import { useZap } from './context/ZapContext'
import ZapSettings from './settings/ZapSettings'
import ZapRefreshButton from './refresh/ZapRefreshButton'
import { ChainId } from '@/utils/chains'
import { useEffect, useMemo } from 'react'

const ZapTabs = () => {
  const { chainId, operation, setOperation } = useZap()
  const rToken = useRToken()
  const isDeprecated = isInactiveDTF(useDTFStatus(rToken?.address, rToken?.chainId))
  const disableMint = chainId === ChainId.Arbitrum || isDeprecated

  const backingOptions = useMemo(() => {
    return [
      ...(!disableMint
        ? [{ key: 'mint', label: 'Mint', icon: <Plus size={16} /> }]
        : []),
      { key: 'redeem', label: 'Redeem', icon: <Minus size={16} /> },
    ]
  }, [disableMint])

  useEffect(() => {
    if (disableMint) {
      setOperation('redeem')
    }
  }, [disableMint])

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
