import { t, Trans } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtom, useAtomValue } from 'jotai'
import { rTokenStateAtom } from 'state/atoms'
import { Box, Checkbox, Flex, Text } from 'theme-ui'
import {
  collectDust,
  previousZapTransaction,
  selectedZapTokenAtom,
  zapInputString,
} from '../state/atoms'
import { ui, zapDust, zapDustValue } from '../state/ui-atoms'
import {
  formatQty,
  FOUR_DIGITS,
  TWO_DIGITS,
} from '../state/formatTokenQuantity'
import { zapperLoaded } from '../state/zapper'
import { Suspense } from 'react'

const ZapDust = () => {
  const dustValue = useAtomValue(zapDustValue)
  const dust = useAtomValue(zapDust)
  const zapCollectDust = useAtomValue(collectDust)
  if (dustValue == null) {
    return null
  }
  const total = dustValue.total

  let str = '+ ' + formatQty(total, TWO_DIGITS) + ' in dust'
  if (total.amount < 10000n) {
    str = '*'
  }
  console.log(total.amount)

  return (
    <span
      title={
        'Dust generated:\n' +
        dust.map((i) => formatQty(i, FOUR_DIGITS)).join('\n') +
        (zapCollectDust
          ? '\n\nDust will be returned to your wallet'
          : '\n\nDust will not be returned to your wallet')
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
  const [, setPrevious] = useAtom(previousZapTransaction)
  return (
    <Flex
      onClick={() => {
        setChecked(!checked)
        setPrevious(null)
      }}
      ml={3}
      mt={2}
      sx={{ fontSize: 1, cursor: 'pointer' }}
    >
      <Text variant="legend" mr={1}>
        Collect dust:
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
