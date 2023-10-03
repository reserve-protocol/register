import { t, Trans } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { rTokenStateAtom } from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import { selectedZapTokenAtom, zapInputString } from '../state/atoms'
import { ui, zapDustValue } from '../state/ui-atoms'
import { formatQty, TWO_DIGITS } from '../state/formatTokenQuantity'
import { zapperState } from '../state/zapper'

const ZapDust = () => {
  const dustValue = useAtomValue(zapDustValue)
  if (dustValue == null) {
    return null
  }
  const total = dustValue.total
  let str = '+ ' + formatQty(total, TWO_DIGITS) + ' in dust'
  if (total.amount < 10000n) {
    str = '*'
  }

  return (
    <span
      title={
        'Dust generated:\n' +
        dustValue.dust
          .map((i) => i.dustQuantity.formatWithSymbol())
          .join('\n') +
        '\n\nDust will be returned to your wallet'
      }
    >
      ({str})
    </span>
  )
}
const ZapOutput = () => {
  return (
    <Flex ml={3} mt={2} sx={{ fontSize: 1 }}>
      <Text variant="legend" mr={1}>
        <Trans>Output</Trans>:
      </Text>
      <Text variant="strong">
        {useAtomValue(ui.output.textBox) || 'None'} <ZapDust />
      </Text>
    </Flex>
  )
}

const ZapInput = (props: Partial<TransactionInputProps>) => {
  const token = useAtomValue(selectedZapTokenAtom)
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)
  const zapSymbol = token?.symbol ?? 'ETH'
  const maxAmountString = useAtomValue(ui.input.maxAmount)
  const [loading, hasError] = useAtomValue(ui.zapState)
  const s = useAtomValue(zapperState)

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <TransactionInput
          placeholder={`${zapSymbol} ${t`Amount`}`}
          amountAtom={zapInputString}
          title={t`Mint with ${zapSymbol}`}
          maxAmount={maxAmountString || '0'}
          disabled={issuancePaused || frozen || loading || hasError}
          {...props}
        />
        <Text
          variant="legend"
          sx={{
            position: 'absolute',
            right: '16px',
            top: '47px',
            fontSize: 1,
            color: 'lightText',
          }}
        >
          {zapSymbol}
        </Text>
      </Box>
      {s.state === 'loading' ? (
        <Flex ml={3} mt={2} sx={{ fontSize: 1 }}>
          <Text variant="legend" mr={1}>
            <Trans>Loading...</Trans>
          </Text>
        </Flex>
      ) : (
        <ZapOutput />
      )}
    </>
  )
}

export default ZapInput
