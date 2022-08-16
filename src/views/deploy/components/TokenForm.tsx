import { t } from '@lingui/macro'
import { Text } from 'theme-ui'
import { FormField } from 'components/field'
import RIcon from 'components/icons/RIcon'
import { Box, BoxProps } from 'theme-ui'
import { isAddress } from 'utils'

/**
 * View: Deploy -> Token setup
 */
const TokenForm = (props: BoxProps) => (
  <Box {...props}>
    <Box variant="layout.verticalAlign" mb={4}>
      <RIcon />
      <Text ml={2} variant="title">
        RToken Details
      </Text>
    </Box>
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
      label={t`Mandate`}
      placeholder={t`RToken mandate`}
      mb={3}
      name="manifesto"
      options={{
        required: t`Manifesto is required`,
      }}
    />
    <FormField
      label={t`Ownership address`}
      placeholder={t`Ownership address`}
      name="ownerAddress"
      disabled
      options={{
        required: t`RToken owner address is required`,
        validate: (value) => !!isAddress(value) || t`Invalid address`,
      }}
    />
  </Box>
)

export default TokenForm
