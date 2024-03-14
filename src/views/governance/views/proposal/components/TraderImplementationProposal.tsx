import { Trans, t } from '@lingui/macro'
import { FormField } from 'components/field'
import { Box, BoxProps, Card, Divider, Text } from 'theme-ui'
import { addressPattern } from 'utils'

const TraderImplementationProposal = (props: BoxProps) => {
  return (
    <Card p={4} variant="cards.form" {...props}>
      <Text variant="title">
        <Trans>Trader implementations</Trans>
      </Text>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <FormField
        label={t`Batch trade`}
        placeholder={t`Trader contract address`}
        help={t`Trader contract for batch trades.`}
        name="batchTradeImplementation"
        mb={3}
        options={{
          required: true,
          pattern: addressPattern,
        }}
      />
      <FormField
        label={t`Dutch trade`}
        placeholder={t`Trader contract address`}
        help={t`Trader contract for Dutch trades.`}
        name="dutchTradeImplementation"
        options={{
          required: true,
          pattern: addressPattern,
        }}
      />
    </Card>
  )
}

export default TraderImplementationProposal
