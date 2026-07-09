import BridgeNavIcon from '@/components/icons/BridgeNavIcon'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFExposureDataAtom } from '@/state/dtf/atoms'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import useIsDarkMode from '@/hooks/use-is-dark-mode'
import BridgeInfoDialog from './bridge-info-dialog'
import { Trans } from '@lingui/react/macro'

interface BridgeLabelProps {
  address: string
  tokenSymbol?: string
  tokenName?: string
  compact?: boolean
}

const BridgeLabel = ({
  address,
  tokenSymbol,
  tokenName,
  compact = false,
}: BridgeLabelProps) => {
  const [open, setOpen] = useState(false)
  const chainId = useAtomValue(chainIdAtom)
  const exposureData = useAtomValue(indexDTFExposureDataAtom)
  const isDarkMode = useIsDarkMode()

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
  const bridgeLogo = (isDarkMode && bridge.logoDark) || bridge.logo

  if (compact) {
    return (
      <>
        <button
          type="button"
          className="font-normal text-current underline underline-offset-2 transition-colors hover:text-primary"
          onClick={() => setOpen(true)}
        >
          <Trans>Bridged</Trans>
        </button>
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

  return (
    <>
      <div
        className={cn(
          'flex cursor-pointer items-center justify-center rounded-full bg-black/5 hover:bg-primary/10 hover:text-primary',
          compact ? 'h-5 w-8 px-1' : 'h-8 w-10 px-1.5'
        )}
        role="button"
        onClick={() => setOpen(true)}
      >
        {bridgeLogo && (
          <img
            src={bridgeLogo}
            alt={bridge.name}
            className={compact ? 'h-3 w-3' : 'h-4 w-4'}
          />
        )}
        <BridgeNavIcon
          className={compact ? '-ml-0.5 h-3 w-3' : '-ml-1 h-4 w-4'}
        />
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
