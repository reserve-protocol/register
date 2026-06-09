import CirclesIcon from 'components/icons/CirclesIcon'
import { Trans, useLingui } from '@lingui/react/macro'
import { useZap } from '../context/ZapContext'
import { Button } from '@/components/ui/button'

const ZapManualMint = () => {
  const { t } = useLingui()
  const { operation, setZapEnabled } = useZap()

  return (
    <div className="flex flex-col gap-2 p-4">
      <CirclesIcon color="currentColor" />
      <span className="text-lg font-bold mt-1">
        <Trans>Bring your own collateral</Trans>
      </span>
      <div className="mt-2">
        <Button
          variant="muted"
          size="sm"
          onClick={() => setZapEnabled(false)}
        >
          {operation === 'mint' ? t`Manual Mint` : t`Manual Redeem`}
        </Button>
      </div>
    </div>
  )
}

export default ZapManualMint
