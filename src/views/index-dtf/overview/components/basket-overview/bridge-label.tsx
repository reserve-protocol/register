import BridgeNavIcon from '@/components/icons/BridgeNavIcon'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFExposureDataAtom } from '@/state/dtf/atoms'
import { useState, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import BridgeInfoDialog from './bridge-info-dialog'

interface BridgeLabelProps {
  address: string
  tokenSymbol?: string
  tokenName?: string
}

const BridgeLabel = ({ address, tokenSymbol, tokenName }: BridgeLabelProps) => {
  const [open, setOpen] = useState(false)
  const chainId = useAtomValue(chainIdAtom)
  const exposureData = useAtomValue(indexDTFExposureDataAtom)

  const bridgeInfo = useMemo(() => {
    if (!exposureData) return null

    for (const group of exposureData) {
      const token = group.tokens.find(
        (t) => t.address.toLowerCase() === address.toLowerCase()
      )
      if (token?.bridge) {
        return {
          native: group.native,
          bridge: token.bridge,
          mapping: {
            symbol: token.symbol,
            wrappedVersion: token.bridge.wrappedVersion,
          },
        }
      }
    }
    return null
  }, [exposureData, address])

  if (!bridgeInfo) return null

  if (bridgeInfo.mapping.wrappedVersion) return null

  const { bridge } = bridgeInfo

  return (
    <>
      <div
        className="rounded-full bg-black/5 p-1 flex items-center gap-1.5 justify-center hover:bg-primary/10 hover:text-primary cursor-pointer"
        role="button"
        onClick={() => setOpen(true)}
      >
        {bridge.logo && (
          <img src={bridge.logo} alt={bridge.name} className="h-4 w-4" />
        )}
        <BridgeNavIcon className="h-4 w-4" />
      </div>
      <BridgeInfoDialog
        open={open}
        setOpen={setOpen}
        bridgeInfo={bridgeInfo}
        tokenAddress={address}
        tokenSymbol={tokenSymbol}
        tokenName={tokenName}
        chainId={chainId}
      />
    </>
  )
}

export default BridgeLabel
