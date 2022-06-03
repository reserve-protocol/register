import { t, Trans } from '@lingui/macro'
import { Card } from 'components'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import Field from './Field'

const BackingForm = (props: BoxProps) => {
  return (
    <Card p={4} {...props}>
      <Box p={1} pt={0} pb={2}>
        <Text sx={{ fontSize: 3 }}>
          <Trans>Backing Manager</Trans>
        </Text>
      </Box>
      <Divider mx={-4} mb={3} />
      <Field
        label={t`Token name`}
        placeholder={t`Input token name`}
        onChange={() => {}}
        value=""
        help={t`Test`}
        mb={3}
      />
      <Field
        label={t`Ticker`}
        placeholder={t`Input ticker`}
        onChange={() => {}}
        value=""
        help={t`Test`}
        mb={3}
      />
      <Field
        label={t`Ownership address`}
        placeholder={t`Input ownership address`}
        onChange={() => {}}
        value=""
        help={t`Test`}
      />
    </Card>
  )
}

export default BackingForm
