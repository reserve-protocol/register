import { Button } from '@/components/ui/button'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import ZapMint from './zap-mint'

const IndexCTAsOverviewMobile = () => {
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
            className="rounded-3xl h-9 sm:h-12 w-full"
            onClick={() => {
              setTab('buy')
              open()
            }}
          >
            Buy
          </Button>
          <Button
            className="rounded-3xl h-9 sm:h-12 w-full"
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

export default IndexCTAsOverviewMobile
