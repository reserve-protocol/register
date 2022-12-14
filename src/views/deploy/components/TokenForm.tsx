import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps, Text } from 'theme-ui'

/**
 * View: Deploy -> Token setup
 */
const TokenForm = (props: BoxProps) => {
  const { watch } = useFormContext()
  const [tickerValue] = watch(['ticker'])

  return (
    <Box {...props}>
      <Box variant="layout.verticalAlign" mb={4}>
        <Text ml={2} variant="title">
          <Trans>RToken Details</Trans>
        </Text>
      </Box>
      <FormField
        label={t`Token name`}
        placeholder={t`Input token name`}
        name="name"
        mb={3}
        options={{
          required: t`Token name required`,
        }}
      />
      <FormField
        label={t`Ticker`}
        placeholder={t`Input ticker`}
        name="ticker"
        options={{
          required: t`Token ticker is required`,
        }}
      />
      <Box mt={2} ml={3} mb={3}>
        <Text variant="legend">
          <Trans>Staking token</Trans>:
        </Text>{' '}
        {tickerValue || 'st'}RSR Token,{' '}
        <Text variant="legend">
          <Trans>St Token Ticker</Trans>:
        </Text>{' '}
        {tickerValue || 'st'}RSR
      </Box>
      <FormField
        label={t`Mandate`}
        placeholder={t`RToken mandate`}
        mb={3}
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
}

export default TokenForm
