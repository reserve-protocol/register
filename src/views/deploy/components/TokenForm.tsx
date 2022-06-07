import { t, Trans } from '@lingui/macro'
import { Card } from 'components'
import { FormField, StaticField } from 'components/field'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import { isAddress } from 'utils'

const TokenForm = (props: BoxProps) => {
  const { watch } = useFormContext()
  const ticker = watch('ticker')
  const stRSR = ticker ? `st${ticker.toString().toUpperCase()}RSR` : 'stRSR'

  return (
    <Card p={4} {...props}>
      <Box p={1} pt={0} pb={2}>
        <Text sx={{ fontSize: 3 }}>
          <Trans>RToken Details</Trans>
        </Text>
      </Box>
      <Divider mx={-4} mb={3} />
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
      <StaticField label={t`Staking token`} value={stRSR} mb={3} />
      <FormField
        label={t`Ownership address`}
        placeholder={t`Input ownership address`}
        name="ownerAddress"
        options={{
          required: t`RToken owner address is required`,
          validate: (value) => !!isAddress(value) || t`Invalid address`,
        }}
      />
    </Card>
  )
}

export default TokenForm
