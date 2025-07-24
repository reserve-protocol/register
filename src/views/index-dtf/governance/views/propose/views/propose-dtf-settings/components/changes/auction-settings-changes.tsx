import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { ArrowRight, Clock, ScrollText } from 'lucide-react'
import {
  auctionLengthChangeAtom,
  hasAuctionLengthChangeAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

const AuctionSettingsChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [auctionLengthChange, setAuctionLengthChange] = useAtom(
    auctionLengthChangeAtom
  )
  const hasAuctionLengthChange = useAtomValue(hasAuctionLengthChangeAtom)
  const { setValue } = useFormContext()

  if (!hasAuctionLengthChange || !indexDTF || !auctionLengthChange) return null

  const currentAuctionLength = indexDTF.auctionLength
  const newAuctionLength = auctionLengthChange

  const onRevert = () => {
    setAuctionLengthChange(undefined)
    setValue('auctionLength', currentAuctionLength / 60)
  }

  return (
    <ChangeSection title="Auction Settings" icon={<ScrollText size={16} />}>
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

        <RevertButton size="icon-rounded" onClick={onRevert} />
      </div>
    </ChangeSection>
  )
}

export default AuctionSettingsChanges
