import { Switch } from '@/components/ui/switch'
import BasicInputWithAdditional from '@/views/index-dtf/deploy/components/basic-input-with-additionals'
import { Trans, useLingui } from '@lingui/react/macro'
import { ListChecks, ShieldCheck } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'

const ProposeTradeAllowlist = () => {
  const { t } = useLingui()
  const { control } = useFormContext()

  return (
    <div className="px-2 mb-2 flex flex-col gap-2">
      <div className="px-4 pb-4 text-base">
        <Trans>
          When enforced, a rebalance can only include allowlisted tokens.
          Proposals with other tokens revert when executed.
        </Trans>
      </div>
      <div className="w-full rounded-xl flex items-center gap-2 p-4 bg-muted/70">
        <div className="p-2 border border-foreground rounded-full">
          <ShieldCheck size={14} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col mr-auto">
          <div className="text-base font-bold">
            <Trans>Enforce trade allowlist</Trans>
          </div>
          <div className="text-sm text-muted-foreground">
            <Trans>Restrict rebalances to the tokens below.</Trans>
          </div>
        </div>
        <Controller
          name="tradeAllowlistEnabled"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Switch
              data-testid="settings-trade-allowlist-enabled"
              checked={!!value}
              onCheckedChange={onChange}
            />
          )}
        />
      </div>
      <div className="w-full rounded-xl flex flex-col gap-2 p-4 bg-muted/70">
        <div className="flex items-center gap-2">
          <div className="p-2 border border-foreground rounded-full">
            <ListChecks size={14} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <div className="text-base font-bold">
              <Trans>Allowlisted tokens</Trans>
            </div>
            <div className="text-sm text-muted-foreground">
              <Trans>Token contracts a rebalance may trade.</Trans>
            </div>
          </div>
        </div>
        <BasicInputWithAdditional
          fieldName="tradeAllowlistTokens"
          buttonLabel={t`Add token`}
          inputLabel={t`Token address`}
          placeholder="0x..."
        />
      </div>
    </div>
  )
}

export default ProposeTradeAllowlist
