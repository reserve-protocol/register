import { t, Trans } from '@lingui/macro'
import { NumericalInput } from 'components'
import { LoadingButton } from 'components/button'
import { MaxLabel } from 'components/transaction-input'
import useBlockNumber from 'hooks/useBlockNumber'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { gasPriceAtomBn } from 'state/atoms'
import { Box, Card, Flex, Grid, Spinner, Text } from 'theme-ui'
import ZapTokenSelector from './components/ZapTokenSelector'
import { selectedZapTokenAtom } from './state/atoms'
import { ui } from './state/ui-atoms'
import { resolvedZapState, zapperState } from './state/zapper'

const ZapTextInputField = () => {
  const [[textInput, disabled], onChange] = useAtom(ui.input.textInput)
  const token = useAtomValue(selectedZapTokenAtom)

  return (
    <NumericalInput
      placeholder={`${token?.symbol} ${t`Amount`}`}
      value={textInput}
      disabled={disabled}
      onChange={onChange}
    />
  )
}

const TransactionFee = () => (
  <Text
    as="span"
    variant="legend"
    sx={{ display: 'block', fontSize: 1 }}
    ml="auto"
    mr={2}
  >
    {useAtomValue(ui.output.txFee)}
  </Text>
)

const ZapInput = () => (
  <Flex sx={{ alignItems: 'center' }}>
    <ZapTextInputField />
    <Box mr={2} />
  </Flex>
)

const ZapOutput = () => (
  <NumericalInput
    disabled={true}
    placeholder={'0.0'}
    value={useAtomValue(ui.output.textBox)}
    onChange={() => {}}
  />
)

const ZapMaxInput = () => {
  const [maxAmountString, setToMax] = useAtom(ui.input.maxAmount)
  if (maxAmountString == null) {
    return null
  }
  return (
    <MaxLabel
      text={`Max: ${maxAmountString}`}
      handleClick={setToMax}
      clickable={true}
      compact
    />
  )
}

const ZapButton = () => {
  const [{ loading, enabled, label, loadingLabel }, onClick] = useAtom(
    ui.button
  )

  return (
    <LoadingButton
      loading={loading}
      disabled={!enabled}
      text={label}
      loadingText={loadingLabel}
      mt={3}
      sx={{ width: '100%' }}
      onClick={onClick}
    />
  )
}

const UpdateBlockAndGas = () => {
  const zapState = useAtomValue(resolvedZapState)
  const block = useBlockNumber()
  const gasPriceBn = useAtomValue(gasPriceAtomBn)
  useEffect(() => {
    if (zapState == null || block == null || gasPriceBn == null) return
    if (block === zapState.currentBlock || gasPriceBn.eq(zapState.gasPrice))
      return
    zapState.updateBlockState(block, gasPriceBn.toBigInt())
  }, [zapState, block, gasPriceBn])
  return null
}

/**
 * Zap widget
 */
const Zap = () => {
  const zapState = useAtomValue(zapperState)
  if (zapState.state === 'loading') {
    return (
      <Card
        p={4}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Spinner />
      </Card>
    )
  }
  if (zapState.state === 'hasError') {
    return (
      <Card
        p={4}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Text variant="warning">Error loading zap</Text>
      </Card>
    )
  }
  return (
    <>
      <UpdateBlockAndGas />
      <Card p={4}>
        <Grid columns={1} gap={2}>
          <Text ml={3} as="label" variant="legend">
            <Trans>Mint using Zap</Trans>
          </Text>
          <ZapInput />
          <Box variant="layout.verticalAlign">
            <ZapMaxInput />
          </Box>
          <Box mt={2} />
          <ZapOutput />
          <TransactionFee />
          <ZapButton />
        </Grid>
      </Card>
    </>
  )
}

export default Zap
