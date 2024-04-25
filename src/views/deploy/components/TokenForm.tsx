import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps, Text, Divider, Switch } from 'theme-ui'

/**
 * View: Deploy -> Token setup
 */
const TokenForm = (props: BoxProps) => {
  const { watch, register } = useFormContext()
  const [tickerValue, reweightable] = watch(['ticker', 'reweightable'])

  return (
    <Box {...props}>
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
      <Box mt={2} ml={3} mb={3}>
        <Text variant="legend" sx={{ fontSize: 1 }}>
          <Trans>Staking token</Trans>:
        </Text>{' '}
        <Text sx={{ fontSize: 1 }}>{tickerValue || 'st'}RSR Token, </Text>
        <Text variant="legend" sx={{ fontSize: 1 }}>
          <Trans>St Token Ticker</Trans>:
        </Text>{' '}
        <Text sx={{ fontSize: 1 }}>{tickerValue || 'st'}RSR</Text>
      </Box>
      <FormField
        label={t`Mandate`}
        placeholder={t`RToken mandate`}
        help={t`The mandate describes what goals its governors should try to achieve. By briefly explaining the RToken’s purpose and what the RToken is intended to do, it provides common ground for the governors to decide upon priorities and how to weigh tradeoffs.`}
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
      <Box mt={3} ml={3}>
        <Text variant="bold">Allow RToken basket to change weights</Text>
        <Text mb="2" as="p" sx={{ fontSize: 1 }} variant="legend">
          A re-weightable RToken can have its basket changed in terms of its
          target units (USD/ETH/BTC/etc…). This flexibility allows for the
          addition, removal, and update of target units in the basket via
          governance actions, and could result in drastic shifts in the $USD
          value of an RToken. RToken holders of re-weightable RTokens have fewer
          guarantees than holders of non-re-weightable RTokens. This option
          should only be used if an RToken must be re-weightable in order to
          accomplish its core goals.
        </Text>
        <Switch defaultChecked={reweightable} {...register('reweightable')} />
      </Box>
    </Box>
  )
}

export default TokenForm
