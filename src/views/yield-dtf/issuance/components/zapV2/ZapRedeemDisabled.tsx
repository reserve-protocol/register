import { Button } from '@/components/ui/button'
import { useZap } from './context/ZapContext'

const ZapRedeemDisabled = ({ disableRedeem }: { disableRedeem: boolean }) => {
  const { operation, setZapEnabled } = useZap()
  if (operation !== 'redeem' || !disableRedeem) return null

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col gap-2 justify-center items-center bg-secondary rounded-3xl opacity-95 z-[1]">
      <span className="text-xl">
        Zap Redeem not available during re-collateralization
      </span>
      <Button
        size="sm"
        onClick={() => setZapEnabled(false)}
      >
        Switch to manual minting
      </Button>
    </div>
  )
}

export default ZapRedeemDisabled
