import BridgeNavIcon from '@/components/icons/BridgeNavIcon'
import { chainIdAtom } from '@/state/atoms'
import { getNativeToken } from '@/utils/token-mappings'
import { useState } from 'react'
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

  // Get bridge info from the mapping
  const bridgeInfo = getNativeToken(chainId, address)

  // If no bridge info found, don't show label
  if (!bridgeInfo) return null

  // Don't show bridge label for wrapped tokens
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
          <img
            src={bridge.logo}
            alt={bridge.name}
            className="min-h-4 min-w-4"
          />
        )}
        <BridgeNavIcon className="min-h-4 min-w-4" />
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
