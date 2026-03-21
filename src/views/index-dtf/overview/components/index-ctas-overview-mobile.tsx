import { Button } from '@/components/ui/button'
import { indexDTFStatusAtom } from '@/state/dtf/atoms'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'

const IndexCTAsOverviewMobile = () => {
  const { open, setTab } = useZapperModal()
  const isDeprecated = useAtomValue(indexDTFStatusAtom) === 'deprecated'

  return (
    <div className="block xl:hidden w-full mt-0 xl:mt-3">
      <div className="flex gap-2">
        <Button
          className="rounded-3xl h-8 w-full"
          variant="outline"
          onClick={() => {
            setTab('sell')
            open()
          }}
        >
          SELL
        </Button>
        <Button
          className="rounded-3xl h-8 w-full"
          disabled={isDeprecated}
          onClick={() => {
            setTab('buy')
            open()
          }}
        >
          BUY
        </Button>
      </div>
    </div>
  )
}

export default IndexCTAsOverviewMobile
