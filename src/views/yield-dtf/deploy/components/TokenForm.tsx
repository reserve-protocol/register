import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { useFormContext } from 'react-hook-form'
import { Switch } from '@/components/ui/switch'

interface TokenFormProps {
  className?: string
}

/**
 * View: Deploy -> Token setup
 */
const TokenForm = ({ className }: TokenFormProps) => {
  const { watch, setValue } = useFormContext()
  const [tickerValue, reweightable] = watch(['ticker', 'reweightable'])

  return (
    <div className={className}>
      <FormField
        label={t`Token name`}
        placeholder={t`Input token name`}
        help={t`Token name - the name of the RToken eg. Savings Dollar`}
        name="name"
        mb={3}
        options={{
          required: t`Token name required`,
        }}
      />
      <FormField
        label={t`Ticker`}
        placeholder={t`Input ticker`}
        help={t`Ticker - symbol eg. USD+`}
        name="ticker"
        options={{
          required: t`Token ticker is required`,
        }}
      />
      <div className="mt-2 ml-3 mb-3">
        <span className="text-legend text-xs">
          <Trans>Staking token</Trans>:
        </span>{' '}
        <span className="text-xs">{tickerValue || 'st'}RSR Token, </span>
        <span className="text-legend text-xs">
          <Trans>St Token Ticker</Trans>:
        </span>{' '}
        <span className="text-xs">{tickerValue || 'st'}RSR</span>
      </div>
      <FormField
        label={t`Mandate`}
        placeholder={t`RToken mandate`}
        help={t`The mandate describes what goals its governors should try to achieve. By briefly explaining the RToken's purpose and what the RToken is intended to do, it provides common ground for the governors to decide upon priorities and how to weigh tradeoffs.`}
        textarea
        name="mandate"
        options={{
          required: t`Mandate is required`,
          maxLength: {
            value: 256,
            message: t`Mandate cannot be longer than 256 characters`,
          },
        }}
      />
      <div className="mt-3 ml-3 flex flex-col gap-2">
        <span className="font-bold">Allow RToken basket to change weights</span>
        <p className="text-xs text-legend mb-2">
          A re-weightable RToken can have its basket changed in terms of its
          target units (USD/ETH/BTC/etc…). This flexibility allows for the
          addition, removal, and update of target units in the basket via
          governance actions, and could result in drastic shifts in the $USD
          value of an RToken. RToken holders of re-weightable RTokens have fewer
          guarantees than holders of non-re-weightable RTokens. This option
          should only be used if an RToken must be re-weightable in order to
          accomplish its core goals.
        </p>
        <div className="flex items-center gap-1">
          <Switch
            checked={reweightable}
            onCheckedChange={(checked) => setValue('reweightable', checked)}
          />
        </div>
      </div>
    </div>
  )
}

export default TokenForm
