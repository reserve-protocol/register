import { Button } from '@/components/ui/button'
import { Trans, useLingui } from '@lingui/react/macro'
import Help from 'components/help'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import { useZap } from './context/ZapContext'

const ZapToggleBottom = ({
  setZapEnabled,
}: {
  setZapEnabled: (value: boolean) => void
}) => {
  const { t } = useLingui()
  const { operation } = useZap()

  return (
    <div className="flex gap-4 justify-between flex-col items-start sm:flex-row sm:items-center mb-6 ml-6 sm:ml-10 mr-0 sm:mr-10 lg:mr-6">
      <div className="flex items-center gap-1">
        <AsteriskIcon />
        <span>
          <Trans>Having issues minting? Zaps are in beta</Trans>
        </span>
        <Help
          content={t`Zap Mint is currently in beta. After approval, you might encounter non-executable routes, especially with Base assets. This will not affect your funds, but may require a retry. We're working to enhance route discovery for a smoother experience.`}
          className="mt-1"
        />
      </div>
      <Button
        data-testid="issuance-manual-toggle"
        variant="muted"
        size="sm"
        onClick={() => setZapEnabled(false)}
      >
        {operation === 'mint'
          ? t`Switch to manual minting`
          : t`Switch to manual redemption`}
      </Button>
    </div>
  )
}

export default ZapToggleBottom
