import { t, Trans } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtom, useAtomValue } from 'jotai'
import { rTokenStateAtom } from 'state/atoms'
import { Box, Checkbox, Flex, Text } from 'theme-ui'
import {
  collectDust,
  selectedZapTokenAtom,
  zapInputString,
} from '../state/atoms'
import { ui, zapDustValue } from '../state/ui-atoms'
import { formatQty, TWO_DIGITS } from '../state/formatTokenQuantity'
import { zapperLoaded } from '../state/zapper'
import { Suspense } from 'react'

const ZapDust = () => {
  const dustValue = useAtomValue(zapDustValue)
  const zapCollectDust = useAtomValue(collectDust)
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
        zapCollectDust
          ? '\n\nDust will be returned to your wallet'
          : '\n\nDust will not '
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

const ZapTxInput = (props: Partial<TransactionInputProps>) => {
  const token = useAtomValue(selectedZapTokenAtom)
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)
  const zapSymbol = token?.symbol ?? 'ETH'
  const maxAmountString = useAtomValue(ui.input.maxAmount)
  const [loading, hasError] = useAtomValue(ui.zapState)

  return (
    <TransactionInput
      placeholder={`${zapSymbol} ${t`Amount`}`}
      amountAtom={zapInputString}
      title={t`Mint with ${zapSymbol}`}
      maxAmount={maxAmountString || '0'}
      disabled={issuancePaused || frozen || loading || hasError}
      {...props}
    />
  )
}
const ZapSymbol = () => {
  const token = useAtomValue(selectedZapTokenAtom)
  const zapSymbol = token?.symbol ?? 'ETH'
  return <>{zapSymbol}</>
}
const ZapOutputLabel = () => {
  const s = useAtomValue(zapperLoaded)
  return !s ? (
    <Flex ml={3} mt={2} sx={{ fontSize: 1 }}>
      <Text variant="legend" mr={1}>
        <Trans>Loading...</Trans>
      </Text>
    </Flex>
  ) : (
    <ZapOutput />
  )
}
const ZapCollectDust = () => {
  const [checked, setChecked] = useAtom(collectDust)
  return (
    <Flex
      onClick={() => {
        setChecked(!checked)
      }}
      ml={3}
      mt={2}
      sx={{ fontSize: 1, cursor: 'pointer' }}
    >
      <Text variant="legend" mr={1}>
        <Trans>Collect dust</Trans>:
      </Text>
      <Checkbox
        onChange={() => {
          setChecked(!checked)
        }}
        checked={checked}
      />
    </Flex>
  )
}
const ZapInput = (props: Partial<TransactionInputProps>) => {
  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <ZapTxInput {...props} />
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
          <ZapSymbol />
        </Text>
      </Box>
      <Suspense
        fallback={
          <Flex ml={3} mt={2} sx={{ fontSize: 1 }}>
            <Text variant="legend" mr={1}>
              <Trans>Loading...</Trans>
            </Text>
          </Flex>
        }
      >
        <ZapOutputLabel />
      </Suspense>
      <ZapCollectDust />
    </>
  )
}

export default ZapInput
