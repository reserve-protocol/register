import { formatPercentage, shortenAddress } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowRight, Coins, ListChecks } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import {
  currentSelfFeeAtom,
  currentTradeAllowlistAtom,
  hasSelfFeeChangeAtom,
  hasTradeAllowlistChangesAtom,
  selfFeeChangeAtom,
  tradeAllowlistChangesAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

const V6SettingsChanges = () => {
  const { t } = useLingui()
  const { setValue } = useFormContext()
  const [selfFeeChange, setSelfFeeChange] = useAtom(selfFeeChangeAtom)
  const [allowlistChanges, setAllowlistChanges] = useAtom(
    tradeAllowlistChangesAtom
  )
  const currentSelfFee = useAtomValue(currentSelfFeeAtom)
  const currentAllowlist = useAtomValue(currentTradeAllowlistAtom)
  const hasSelfFeeChange = useAtomValue(hasSelfFeeChangeAtom)
  const hasAllowlistChanges = useAtomValue(hasTradeAllowlistChangesAtom)

  if (!hasSelfFeeChange && !hasAllowlistChanges) return null

  const onRevertSelfFee = () => {
    setSelfFeeChange(undefined)
    setValue('selfFee', currentSelfFee)
  }

  const onRevertAllowlist = () => {
    setAllowlistChanges({})
    setValue('tradeAllowlistEnabled', currentAllowlist?.enabled)
    setValue('tradeAllowlistTokens', [...(currentAllowlist?.tokens ?? [])])
  }

  return (
    <>
      {hasSelfFeeChange &&
        selfFeeChange !== undefined &&
        currentSelfFee !== undefined && (
          <ChangeSection
            title={<Trans>Holder share</Trans>}
            icon={<Coins size={16} />}
          >
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border">
              <div className="flex items-center gap-3 text-sm mr-auto">
                <span className="text-muted-foreground">
                  {formatPercentage(currentSelfFee)}
                </span>
                <ArrowRight size={16} className="text-primary" />
                <span className="text-primary font-medium">
                  {formatPercentage(selfFeeChange)}
                </span>
              </div>
              <RevertButton size="icon-rounded" onClick={onRevertSelfFee} />
            </div>
          </ChangeSection>
        )}
      {hasAllowlistChanges && (
        <ChangeSection
          title={<Trans>Trade allowlist</Trans>}
          icon={<ListChecks size={16} />}
        >
          <div
            className="flex items-start gap-2 p-4 rounded-2xl bg-muted/70 border"
            data-testid="settings-trade-allowlist-changes"
          >
            <div className="flex flex-col gap-1 text-sm mr-auto">
              {allowlistChanges.enabled !== undefined && (
                <span>
                  {allowlistChanges.enabled
                    ? t`Enforcement on`
                    : t`Enforcement off`}
                </span>
              )}
              {allowlistChanges.add?.map((token) => (
                <span key={`add-${token}`} className="text-primary">
                  + {shortenAddress(token)}
                </span>
              ))}
              {allowlistChanges.remove?.map((token) => (
                <span key={`remove-${token}`} className="text-destructive">
                  − {shortenAddress(token)}
                </span>
              ))}
            </div>
            <RevertButton size="icon-rounded" onClick={onRevertAllowlist} />
          </div>
        </ChangeSection>
      )}
    </>
  )
}

export default V6SettingsChanges
