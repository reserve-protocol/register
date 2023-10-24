import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { Component, Suspense, useEffect, useState } from 'react'
import { blockAtom, gasFeeAtom } from 'state/atoms'
import { Box, Text, Card, Flex, Checkbox, Label } from 'theme-ui'
import ConfirmZap from './components/ConfirmZap'
import ZapButton from './components/ZapButton'
import ZapInput from './components/ZapInput'
import {
  collectDust,
  previousZapTransaction,
  selectedZapTokenAtom,
  zapOutputSlippage,
} from './state/atoms'
import { resolvedZapState } from './state/zapper'
import Help from 'components/help'
import { GearIcon } from 'components/icons/GearIcon'
import Popover from 'components/popover'
import { ui } from './state/ui-atoms'
import { ToggleButton } from 'components/ToggleButton'
import { Trans, t } from '@lingui/macro'

const UpdateBlockAndGas = () => {
  const zapState = useAtomValue(resolvedZapState)
  const block = useAtomValue(blockAtom)
  const gasPriceBn = useAtomValue(gasFeeAtom)
  useEffect(() => {
    if (zapState == null || block == null || gasPriceBn == null) return
    if (block === zapState.currentBlock || gasPriceBn === zapState.gasPrice)
      return
    zapState.updateBlockState(block, gasPriceBn)
  }, [zapState, block, gasPriceBn])
  return null
}

class CatchErrors extends Component<{ children: any }> {
  state = {
    hasError: false,
  }
  constructor(props: any) {
    super(props)
  }
  componentDidCatch() {
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return <>{this.props.children}</>
  }
}

const ZapToggle = ({ slippage }: { slippage: bigint }) => {
  const label = `${((1 / Number(slippage)) * 10000).toFixed(2)} bps`
  const [selectedSlippage, setSlippage] = useAtom(zapOutputSlippage)
  return (
    <ToggleButton
      mr={3}
      onClick={() => setSlippage(slippage)}
      selected={selectedSlippage === slippage}
    >
      {label}
    </ToggleButton>
  )
}
const slippageOptions = [100000n, 250000n, 500000n]
const ZapCustomSetting = () => {
  const [selectedSlippage, setSlippage] = useAtom(zapOutputSlippage)
  const label = `${((1 / Number(selectedSlippage)) * 10000).toFixed(2)}`
  const selected = !slippageOptions.includes(selectedSlippage)
  return (
    <Box
      px={2}
      sx={{
        border: '2px solid',
        borderRadius: 6,
        backgroundColor: 'transparent',
        color: selected ? 'primary' : 'lightText',
      }}
    >
      <input
        style={{
          width: 40,
          borderWidth: 0,
          color: 'var(--rp-black)',
          background: 'none',
        }}
        onBlur={(e) => {
          const parsed = parseFloat(e.target.value)
          if (isNaN(parsed)) {
            return
          }
          const slippage = BigInt(
            Math.floor(parseFloat(e.target.value) * 1000000)
          )
          setSlippage(slippage)
        }}
        defaultValue={label}
      />
      <Text style={{ fontWeight: 500 }}>
        <Trans>bps</Trans>
      </Text>
    </Box>
  )
}
const ZapSlippageSettings = () => {
  return (
    <Box ml={3} mt={3}>
      <Flex
        mb={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text variant="strong">
          <Trans>Mint slippage:</Trans>
        </Text>
        <Help
          content={t`The maximum amount of slippage you are willing to accept when minting. Higher slippage settings will make the transaction more likely to succeed, but may result in fewer tokens minted.`}
        />
      </Flex>
      <Flex mt={2}>
        {slippageOptions.map((slippage) => (
          <ZapToggle key={slippage.toString()} slippage={slippage} />
        ))}
        <ZapCustomSetting />
      </Flex>
    </Box>
  )
}

const ZapCollectDust = () => {
  const [checked, setChecked] = useAtom(collectDust)
  const [, setPrevious] = useAtom(previousZapTransaction)
  return (
    <Box ml={3} mt={3}>
      <Flex
        mb={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text variant="strong">
          <Trans>Dust:</Trans>
        </Text>

        <Help
          content={
            t`Dust is the leftover amount of tokens that cannot be exchanged. If you choose to collect dust, it will be sent back to your wallet. Sending dust back to the wallet will increase transaction fee.`
          }
        />
      </Flex>
      <Flex mt={2} sx={{ alignItems: 'center' }}>
        <Label>
          <Checkbox
            title="Collect dust"
            onChange={() => {
              setChecked(!checked)
              setPrevious(null)
            }}
            checked={checked}
          />{' '}
          <Trans>
            Send dust back to wallet
          </Trans>
        </Label>
      </Flex>
    </Box>
  )
}
const ZapSettingsDisplay = () => {
  return (
    <Card
      p={3}
      sx={{ borderColor: 'border', borderWidth: 1, borderStyle: 'solid' }}
    >
      <ZapCollectDust />
      <ZapSlippageSettings />
    </Card>
  )
}
const ZapSettings = () => {
  const [open, setOpen] = useAtom(ui.zapSettingsOpen)
  return (
    <Box>
      <Flex
        mr={2}
        mb={1}
        sx={{ flexDirection: 'row-reverse', alignItems: 'center' }}
      >
        <Popover
          zIndex={100009}
          placement="bottom"
          onDismiss={() => setOpen(false)}
          content={<ZapSettingsDisplay />}
          show={open}
        >
          <GearIcon
            onClick={() => setOpen(!open)}
            style={{ cursor: 'pointer' }}
          />
        </Popover>

        <Text mb={2} mr={2}>
          <Trans>Settings</Trans>
        </Text>
      </Flex>
    </Box>
  )
}
/**
 * Zap widget
 */
const Zap = () => {
  const [isZapping, setZapping] = useState(false)
  const rToken = useRToken()
  const selectedToken = useAtomValue(selectedZapTokenAtom)
  const handleClick = () => {
    setZapping(true)
    mixpanel.track('Clicked Zap', {
      RToken: rToken?.address.toLowerCase() ?? '',
      inputToken: selectedToken?.symbol,
    })
  }

  return (
    <CatchErrors>
      <Suspense fallback={<></>}>
        <UpdateBlockAndGas />
      </Suspense>
      <Card p={4}>
        <ZapSettings />
        <ZapInput />
        <ZapButton onClick={handleClick} />
      </Card>
      {isZapping && <ConfirmZap onClose={() => setZapping(false)} />}
    </CatchErrors>
  )
}

export default Zap
