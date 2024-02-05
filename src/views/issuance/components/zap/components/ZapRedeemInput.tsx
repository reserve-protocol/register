import { t, Trans } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { Suspense } from 'react'
import { rTokenAtom, rTokenStateAtom } from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import {
  collectDust,
  selectedZapTokenAtom,
  zapRedeemInputString,
} from '../state/atoms'
import {
  formatQty,
  formatQtyNoLessThan0,
  FOUR_DIGITS,
  TWO_DIGITS,
} from '../state/formatTokenQuantity'
import { redeemZapDust, redeemZapDustValue, ui } from '../state/ui-atoms'
import { zapperLoaded } from '../state/zapper'

const ZapDust = () => {
  const dustValue = useAtomValue(redeemZapDustValue)
  const dust = useAtomValue(redeemZapDust)
  const zapCollectDust = useAtomValue(collectDust)
  
  if (
    dust.length === 0 ||
    dustValue == null ||
    dustValue.total.amount < 10000n
  ) {
    return <Trans>None</Trans>
  }
  const amts = dust.map((i) => formatQtyNoLessThan0(i)).filter((i) => i != null)

  let str: any = amts.join(', ') + ' ~' + formatQty(dustValue.total)

  if (str.length > 30) {
    str = <>{amts.length} <Trans>dust tokens worth </Trans> ~{formatQty(dustValue.total)}</>
  }

  return (
    <Text
      sx={{ fontSize: 1 }}
      title={
        'Dust generated:\n' +
        dust.map((i) => formatQty(i, FOUR_DIGITS)).join('\n') +
        (zapCollectDust
          ? '\n\nDust will be returned to your wallet'
          : '\n\nDust will not be returned to your wallet')
      }
    >
      {str}
    </Text>
  )
}
const ZapOutput = () => {
  return (
    <Flex ml={3} mt={2} sx={{ fontSize: 1 }}>
      <Text variant="legend" mr={1}>
        <Trans>Min Output</Trans>:
      </Text>
      <Text variant="strong">
        {useAtomValue(ui.zapRedeemOutput.textBox) || 'None'}
      </Text>
    </Flex>
  )
}

const ZapSlippage = () => {
  const slippage = useAtomValue(ui.zapRedeemOutput.slippage)

  return (
    <Flex ml={3} mt={2} sx={{ fontSize: 1 }}>
      <Text variant="legend" mr={1}>
        <Trans>Price impact</Trans>:
      </Text>
      <Text variant="strong">
        {slippage == null ? (
          <Trans>None</Trans>
        ) : slippage < 0.01 ? (
          '< 0.01%'
        ) : (
          slippage.toFixed(2) + "%"
        )}
        
      </Text>
    </Flex>
  )
}

const ZapDustRow = () => {
  return (
    <Flex ml={3} mt={2} sx={{ fontSize: 1 }}>
      <Text variant="legend" mr={1}>
        <Trans>Dust</Trans>:
      </Text>
      <Text variant="strong">
        <ZapDust />
      </Text>
    </Flex>
  )
}

const ZapTxInput = (props: Partial<TransactionInputProps>) => {
  const token = useAtomValue(rTokenAtom)
  const selectedZapToken = useAtomValue(selectedZapTokenAtom)
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)
  const zapSymbol = token?.symbol ?? 'ETH'
  const maxAmountString = useAtomValue(ui.input.maxRedeemAmount)
  const [loading, hasError] = useAtomValue(ui.zapState)

  return (
    <TransactionInput
      placeholder={`${zapSymbol} ${t`Amount`}`}
      amountAtom={zapRedeemInputString}
      title={t`Redeem into ${selectedZapToken?.symbol ?? 'ETH'}`}
      maxAmount={maxAmountString || '0'}
      disabled={issuancePaused || frozen || loading || hasError}
      {...props}
    />
  )
}
const ZapSymbol = () => {
  const rToken = useAtomValue(rTokenAtom)
  return <>{rToken?.symbol}</>
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
const ZapRedeemInput = (props: Partial<TransactionInputProps>) => {
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
        <ZapSlippage />
        <ZapDustRow />
      </Suspense>
    </>
  )
}

export default ZapRedeemInput
