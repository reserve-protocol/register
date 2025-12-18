import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import {
  indexDTFAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { ArrowRight, Clock, ScrollText, LandPlot, HandCoins } from 'lucide-react'
import {
  auctionLengthChangeAtom,
  hasAuctionLengthChangeAtom,
  weightControlChangeAtom,
  hasWeightControlChangeAtom,
  bidsEnabledChangeAtom,
  hasBidsEnabledChangeAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'
import { useReadContract } from 'wagmi'

const AuctionSettingsChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const isV5 = version.startsWith('5')

  const [auctionLengthChange, setAuctionLengthChange] = useAtom(
    auctionLengthChangeAtom
  )
  const [weightControlChange, setWeightControlChange] = useAtom(
    weightControlChangeAtom
  )
  const [bidsEnabledChange, setBidsEnabledChange] = useAtom(
    bidsEnabledChangeAtom
  )
  const hasAuctionLengthChange = useAtomValue(hasAuctionLengthChangeAtom)
  const hasWeightControlChange = useAtomValue(hasWeightControlChangeAtom)
  const hasBidsEnabledChange = useAtomValue(hasBidsEnabledChangeAtom)
  const { setValue } = useFormContext()

  // Read current bidsEnabled from contract (v5+ only)
  const { data: currentBidsEnabled } = useReadContract({
    abi: dtfIndexAbiV5,
    address: indexDTF?.id,
    functionName: 'bidsEnabled',
    chainId: indexDTF?.chainId,
    query: {
      enabled: !!indexDTF?.id && isV5,
    },
  })

  const hasAnyChange =
    hasAuctionLengthChange || hasWeightControlChange || hasBidsEnabledChange

  if (!indexDTF || !hasAnyChange) return null

  const currentAuctionLength = indexDTF.auctionLength
  const newAuctionLength = auctionLengthChange

  const onRevertAuctionLength = () => {
    setAuctionLengthChange(undefined)
    setValue('auctionLength', currentAuctionLength / 60)
  }

  const onRevertWeightControl = () => {
    setWeightControlChange(undefined)
    setValue('weightControl', rebalanceControl?.weightControl ?? true)
  }

  const onRevertBidsEnabled = () => {
    setBidsEnabledChange(undefined)
    setValue('bidsEnabled', currentBidsEnabled ?? true)
  }

  return (
    <ChangeSection title="Auction Settings" icon={<ScrollText size={16} />}>
      {hasAuctionLengthChange && auctionLengthChange && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border ">
          <Clock size={16} />
          <div className="mr-auto">
            <div className="text-sm font-medium">Auction Length</div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {currentAuctionLength / 60} minutes
              </span>
              <ArrowRight size={16} className="text-primary" />
              <span className="text-primary font-medium">
                {newAuctionLength} minutes
              </span>
            </div>
          </div>

          <RevertButton size="icon-rounded" onClick={onRevertAuctionLength} />
        </div>
      )}

      {hasBidsEnabledChange &&
        bidsEnabledChange !== undefined &&
        isV5 &&
        currentBidsEnabled !== undefined && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border ">
            <HandCoins size={16} />
            <div className="mr-auto">
              <div className="text-sm font-medium">Permissionless Bids</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  {currentBidsEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <ArrowRight size={16} className="text-primary" />
                <span className="text-primary font-medium">
                  {bidsEnabledChange ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <RevertButton size="icon-rounded" onClick={onRevertBidsEnabled} />
          </div>
        )}

      {hasWeightControlChange &&
        weightControlChange !== undefined &&
        rebalanceControl && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border ">
            <LandPlot size={16} />
            <div className="mr-auto">
              <div className="text-sm font-medium">Weight Control</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  {rebalanceControl.weightControl ? 'Enabled' : 'Disabled'}
                </span>
                <ArrowRight size={16} className="text-primary" />
                <span className="text-primary font-medium">
                  {weightControlChange ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <RevertButton size="icon-rounded" onClick={onRevertWeightControl} />
          </div>
        )}
    </ChangeSection>
  )
}

export default AuctionSettingsChanges
