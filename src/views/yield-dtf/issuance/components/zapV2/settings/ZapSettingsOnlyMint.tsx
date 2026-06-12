import { Checkbox } from '@/components/ui/checkbox'
import { Trans, useLingui } from '@lingui/react/macro'
import { useZap } from '../context/ZapContext'

const ZapSettingsOnlyMint = () => {
  const { t } = useLingui()
  const { onlyMint, setOnlyMint } = useZap()

  return (
    <div className="rounded-lg border border-secondary bg-card">
      <label className="flex justify-between p-3 cursor-pointer">
        <div className="flex items-center gap-1.5">
          <span>
            <Trans>Force minting RTokens</Trans>
          </span>
        </div>
        <Checkbox
          title={t`Force minting RTokens`}
          onCheckedChange={() => setOnlyMint(!onlyMint)}
          checked={onlyMint}
        />
      </label>
    </div>
  )
}

export default ZapSettingsOnlyMint
