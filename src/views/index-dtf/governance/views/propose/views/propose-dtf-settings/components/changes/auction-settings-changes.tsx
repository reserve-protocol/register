import { indexDTFAtom, indexDTFRebalanceControlAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { ArrowRight, Clock, ScrollText, LandPlot } from 'lucide-react'
import {
  auctionLengthChangeAtom,
  hasAuctionLengthChangeAtom,
  weightControlChangeAtom,
  hasWeightControlChangeAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

const AuctionSettingsChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const [auctionLengthChange, setAuctionLengthChange] = useAtom(
    auctionLengthChangeAtom
  )
  const [weightControlChange, setWeightControlChange] = useAtom(
    weightControlChangeAtom
  )
  const hasAuctionLengthChange = useAtomValue(hasAuctionLengthChangeAtom)
  const hasWeightControlChange = useAtomValue(hasWeightControlChangeAtom)
  const { setValue } = useFormContext()

  if (!indexDTF || (!hasAuctionLengthChange && !hasWeightControlChange)) return null

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
      
      {hasWeightControlChange && weightControlChange !== undefined && rebalanceControl && (
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
