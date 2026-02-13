import CirclesIcon from 'components/icons/CirclesIcon'
import { useZap } from '../context/ZapContext'
import { Button } from '@/components/ui/button'

const ZapManualMint = () => {
  const { operation, setZapEnabled } = useZap()

  return (
    <div className="flex flex-col gap-2 p-4">
      <CirclesIcon color="currentColor" />
      <span className="text-lg font-bold mt-1">
        Bring your own collateral
      </span>
      <div className="mt-2">
        <Button
          variant="muted"
          size="sm"
          onClick={() => setZapEnabled(false)}
        >
          Manual {operation === 'mint' ? 'Mint' : 'Redeem'}
        </Button>
      </div>
    </div>
  )
}

export default ZapManualMint
