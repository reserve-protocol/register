import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { indexDTFAtom, isBrandManagerAtom } from '@/state/dtf/atoms'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { ImagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import ZapMint from './zap-mint'

const ZapBuySellButtons = () => {
  const { open, setTab } = useZapperModal()
  return (
    <div className="block xl:hidden w-full mt-3">
      <ZapMint>
        <div
          className="flex gap-2"
          onClick={(e) => {
            if (!(e.target instanceof HTMLButtonElement)) {
              e.preventDefault()
            }
          }}
        >
          <Button
            className="rounded-xl h-12 w-full"
            onClick={() => {
              setTab('buy')
              open()
            }}
          >
            Buy
          </Button>
          <Button
            className="rounded-xl h-12 w-full"
            variant="outline"
            onClick={() => {
              setTab('sell')
              open()
            }}
          >
            Sell
          </Button>
        </div>
      </ZapMint>
    </div>
  )
}

const BrandManagerEditButton = () => {
  const isBrandManager = useAtomValue(isBrandManagerAtom)

  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

  if (!isBrandManager) {
    return null
  }

  return (
    <Link to="../manage" onClick={() => trackClick('brand_manager')}>
      <Button variant="outline" size="sm" className="gap-1 rounded-full ml-3">
        <ImagePlus size={14} />
        Edit page
      </Button>
    </Link>
  )
}

const IndexTokenOverview = () => {
  const dtf = useAtomValue(indexDTFAtom)

  return (
    <Card className="p-2">
      <ZapBuySellButtons />
    </Card>
  )
}

export default IndexTokenOverview
