import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'

interface TokenFormProps {
  className?: string
}

/**
 * View: Deploy -> Token setup
 */
const TokenForm = ({ className }: TokenFormProps) => (
  <div className={className}>
    <div className="flex items-center mb-4">
      <span className="ml-2 text-xl font-medium">
        <Trans>RToken Details</Trans>
      </span>
    </div>
    <FormField
      label={t`Token name`}
      placeholder={t`Input token name`}
      className="mb-4"
      name="name"
      options={{
        required: t`Token name required`,
      }}
    />
    <FormField
      label={t`Ticker`}
      placeholder={t`Input ticker`}
      className="mb-4"
      name="ticker"
      options={{
        required: t`Token ticker is required`,
      }}
    />
    <FormField
      label={t`Mandate`}
      placeholder={t`RToken mandate`}
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
  </div>
)

export default TokenForm
