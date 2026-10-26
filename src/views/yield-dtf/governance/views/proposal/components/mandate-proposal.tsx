import { Trans, useLingui } from '@lingui/react/macro'
import { Card } from '@/components/ui/card'
import { FormField } from 'components/field'
import { checkVersion } from '@/utils'

export const supportsMandateUpdates = (version?: string) =>
  !!version && checkVersion('4.2.0', version)

export const hasMandate = (value?: string) => !!value?.trim()

const MandateProposal = () => {
  const { t } = useLingui()

  return (
    <Card className="p-6 bg-secondary" data-testid="yield-proposal-mandate">
      <span className="text-lg font-semibold">
        <Trans>Mandate</Trans>
      </span>
      <FormField
        className="mt-6"
        label={t`Mandate`}
        placeholder={t`RToken mandate`}
        textarea
        name="mandate"
        options={{
          validate: (value) => hasMandate(value) || t`Mandate is required`,
        }}
      />
    </Card>
  )
}

export default MandateProposal
