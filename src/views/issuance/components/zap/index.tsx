import { Trans } from '@lingui/macro'
import { LoadingButton } from 'components/button'
import useBlockNumber from 'hooks/useBlockNumber'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { gasPriceAtomBn } from 'state/atoms'
import { BoxProps, Card, Flex, Grid, Spinner, Text } from 'theme-ui'
import ZapInput from './components/ZapInput'
import { ui } from './state/ui-atoms'
import { resolvedZapState, zapperState } from './state/zapper'

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

const ZapOutput = (props: BoxProps) => (
  <Flex {...props} sx={{ fontSize: 1 }}>
    <Text variant="legend" mr={1}>
      <Trans>Output</Trans>:
    </Text>
    <Text variant="strong">{useAtomValue(ui.output.textBox) || 'None'}</Text>
  </Flex>
)

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
      mt={2}
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
          <ZapInput />
          <ZapOutput ml={3} />
          <ZapButton />
        </Grid>
      </Card>
    </>
  )
}

export default Zap
