import { t, Trans } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { rTokenStatusAtom } from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import { selectedZapTokenAtom, zapInputString } from '../state/atoms'
import { ui } from '../state/ui-atoms'

const ZapOutput = () => (
  <Flex ml={3} mt={2} sx={{ fontSize: 1 }}>
    <Text variant="legend" mr={1}>
      <Trans>Output</Trans>:
    </Text>
    <Text variant="strong">{useAtomValue(ui.output.textBox) || 'None'}</Text>
  </Flex>
)

const ZapInput = (props: Partial<TransactionInputProps>) => {
  const token = useAtomValue(selectedZapTokenAtom)
  const { issuancePaused, frozen } = useAtomValue(rTokenStatusAtom)
  const zapSymbol = token?.symbol ?? 'ETH'
  const maxAmountString = useAtomValue(ui.input.maxAmount)
  const [loading, hasError] = useAtomValue(ui.zapState)

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <TransactionInput
          placeholder={`${zapSymbol} ${t`Amount`}`}
          amountAtom={zapInputString}
          title={t`Zap mint`}
          maxAmount={maxAmountString || '0'}
          disabled={issuancePaused || frozen || loading || hasError}
          {...props}
        />
        <Text
          variant="legend"
          sx={{
            position: 'absolute',
            right: '20px',
            top: '44px',
            fontSize: 1,
          }}
        >
          {zapSymbol}
        </Text>
      </Box>
      <ZapOutput />
    </>
  )
}

export default ZapInput
