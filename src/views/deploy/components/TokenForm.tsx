import { t } from '@lingui/macro'
import { TitleCard } from 'components/card'
import { FormField } from 'components/field'
import { BoxProps } from 'theme-ui'
import { isAddress } from 'utils'

const TokenForm = (props: BoxProps) => (
  <TitleCard title={t`RToken Detail`} {...props}>
    <FormField
      label={t`Token name`}
      placeholder={t`Input token name`}
      mb={3}
      name="name"
      options={{
        required: t`Token name required`,
      }}
    />
    <FormField
      label={t`Ticker`}
      placeholder={t`Input ticker`}
      mb={3}
      name="ticker"
      options={{
        required: t`Token ticker is required`,
      }}
    />
    <FormField
      label={t`Ownership address`}
      placeholder={t`Input ownership address`}
      name="ownerAddress"
      options={{
        required: t`RToken owner address is required`,
        validate: (value) => !!isAddress(value) || t`Invalid address`,
      }}
    />
  </TitleCard>
)

export default TokenForm
