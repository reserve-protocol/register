import { Trans, t } from '@lingui/macro'
import { ToggleButton } from 'components/ToggleButton'
import Help from 'components/help'
import { GearIcon } from 'components/icons/GearIcon'
import Popover from 'components/popover'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { Box, Card, Checkbox, Flex, Label, Text } from 'theme-ui'
import {
  collectDust,
  previousZapTransaction,
  zapOutputSlippage,
} from '../state/atoms'
import { ui } from '../state/ui-atoms'
import { Button, NumericalInput } from 'components'

const ZapToggle = ({ slippage }: { slippage: bigint }) => {
  const label = formatNumber((1 / Number(slippage)) * 10000)
  const [selectedSlippage, setSlippage] = useAtom(zapOutputSlippage)
  return (
    <ToggleButton
      onClick={() => setSlippage(slippage)}
      selected={selectedSlippage === slippage}
    >
      {label} <Trans>bps</Trans>
    </ToggleButton>
  )
}
const formatNumber = (num: number) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}
const slippageOptions = [100000n, 250000n, 500000n]
const ZapCustomSetting = ({ onBlur }: { onBlur: () => void }) => {
  const [selectedSlippage, setSlippage] = useAtom(zapOutputSlippage)
  const [currentSlippage, setCurrentSlippage] = useState(selectedSlippage)
  const label = `${formatNumber((1 / Number(selectedSlippage)) * 10000)}`
  const selected = !slippageOptions.includes(selectedSlippage)
  return (
    <Flex
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Box
        pr={3}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          border: '2px solid',
          borderRadius: 6,
          width: '100%',
          alignItems: 'center',
          backgroundColor: 'transparent',
          color: selected ? 'primary' : 'lightText',
        }}
      >
        <NumericalInput
          style={{
            width: '100%',
            borderWidth: 0,
            height: 30,
            color: 'var(--rp-black)',
            background: 'none',
          }}
          autoFocus={true}
          onChange={(value) => {
            const parsed = parseFloat(value)
            if (isNaN(parsed)) {
              return
            }
            const slippage = BigInt(Math.floor((1 / parsed) * 10000))
            setCurrentSlippage(slippage)
          }}
          defaultValue={label}
        />
        <Text>
          <Trans>bps</Trans>
        </Text>
      </Box>
      <Button
        small
        ml={2}
        onClick={() => {
          setSlippage(currentSlippage)
          onBlur()
        }}
      >
        <Trans>Save</Trans>
      </Button>
    </Flex>
  )
}
const ZapSlippageSettings = () => {
  const slippage = useAtomValue(zapOutputSlippage)
  const label = `${formatNumber((1 / Number(slippage)) * 10000)}`
  const [customSlippage, setCustomSlippage] = useState(false)

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
      <Flex mt={2} sx={{ width: 415, justifyContent: 'space-between' }}>
        {customSlippage ? (
          <ZapCustomSetting onBlur={() => setCustomSlippage(false)} />
        ) : (
          <>
            {slippageOptions.map((slippage) => (
              <ZapToggle key={slippage.toString()} slippage={slippage} />
            ))}
            <ToggleButton
              mr={3}
              onClick={() => setCustomSlippage(true)}
              selected={!slippageOptions.includes(slippage)}
            >
              {slippageOptions.includes(slippage) ? (
                <Trans>Custom</Trans>
              ) : (
                <>
                  {label} <Trans>bps</Trans>
                </>
              )}
            </ToggleButton>
          </>
        )}
      </Flex>
    </Box>
  )
}
const ZapCollectDust = () => {
  const [checked, setChecked] = useAtom(collectDust)
  const setPrevious = useSetAtom(previousZapTransaction)
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
          content={t`Dust is the leftover amount of tokens that cannot be exchanged. If you choose to collect dust, it will be sent back to your wallet. Sending dust back to the wallet will increase transaction fee.`}
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
          <Trans>Send dust back to wallet</Trans>
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
export const ZapSettings = () => {
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
