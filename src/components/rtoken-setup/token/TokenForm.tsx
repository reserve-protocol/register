import { t, Trans } from '@lingui/macro'
import Button from '@/components/old/button'
import { FormField } from 'components/field'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import { isAddress } from 'utils'

/**
 * View: Deploy -> Token setup
 */
const TokenForm = (props: BoxProps) => (
  <Box {...props}>
    <Box variant="layout.verticalAlign" mb={4}>
      <Text ml={2} variant="title">
        <Trans>RToken Details</Trans>
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
  </Box>
)

export default TokenForm
