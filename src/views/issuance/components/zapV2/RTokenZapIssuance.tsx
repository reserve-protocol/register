import { Button, Modal, NumericalInput } from 'components'
import ButtonGroup from 'components/button/ButtonGroup'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import Popup from 'components/popup'
import TabMenu from 'components/tab-menu'
import TokenItem from 'components/token-item'
import { useChainlinkPrice } from 'hooks/useChainlinkPrice'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React, { FC, useCallback, useMemo, useState } from 'react'
import {
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Settings,
  X,
} from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { chainIdAtom, rTokenPriceAtom } from 'state/atoms'
import { Box, Checkbox, Divider, IconButton, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import collateralPlugins from 'utils/plugins'
import ZapButton from '../zap/components/ZapButton'
import {
  collectDust,
  previousZapTransaction,
  zapInputString,
  zapOutputSlippage,
  zapQuotePromise,
} from '../zap/state/atoms'
import { formatQty } from '../zap/state/formatTokenQuantity'
import { ui, zapDustValue, zapOutputAmount } from '../zap/state/ui-atoms'
import { ChainId } from 'utils/chains'
import { Address } from 'viem'

const ZapCollectDust = () => {
  const [checked, setChecked] = useAtom(collectDust)
  const setPrevious = useSetAtom(previousZapTransaction)
  return (
    <Box
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'borderFocused',
        backgroundColor: 'focusedBackground',
      }}
    >
      <label
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          cursor: 'pointer',
        }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: '6px' }}>
          <Text>Send dust back to wallet</Text>
        </Box>
        <Checkbox
          title="Collect dust"
          onChange={() => {
            setChecked((c) => !c)
            setPrevious(null)
          }}
          checked={checked}
        />
      </label>
    </Box>
  )
}

const SLIPPAGE_OPTIONS = [100000n, 250000n, 500000n]
const formatNumber = (num: number) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}

const ZapCustomInputSlippage = ({
  showCustomSlippage,
  setShowCustomSlippage,
}: {
  showCustomSlippage: boolean
  setShowCustomSlippage: (show: boolean) => void
}) => {
  const [slippage, setSlippage] = useAtom(zapOutputSlippage)
  const [input, setInput] = useState(
    formatNumber((1 / Number(slippage)) * 10000)
  )

  return !showCustomSlippage ? (
    <Button
      variant="transparent"
      onClick={() => setShowCustomSlippage(true)}
      sx={{
        borderRadius: 8,
        px: '12px',
        py: 2,
      }}
    >
      Custom
    </Button>
  ) : (
    <Box
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'darkBorder',
      }}
    >
      <NumericalInput
        style={{
          maxWidth: '79px',
          fontSize: 16,
          padding: '8px 12px',
        }}
        variant="transparent"
        value={input}
        autoFocus={true}
        onChange={(value) => {
          setInput(value)
          const parsed = parseFloat(value)
          if (isNaN(parsed)) return
          const slippage =
            parsed === 0 ? 0n : BigInt(Math.floor((1 / parsed) * 10000))
          setSlippage(slippage)
        }}
      />
    </Box>
  )
}

const ZapSlippageSettings = () => {
  const [selectedSlippage, setSlippage] = useAtom(zapOutputSlippage)
  const [showCustomSlippage, setShowCustomSlippage] = useState(
    !SLIPPAGE_OPTIONS.includes(selectedSlippage)
  )

  const buttons = useMemo(
    () =>
      SLIPPAGE_OPTIONS.map((bps) => ({
        label: `${formatNumber((1 / Number(bps)) * 10000)} bps`,
        onClick: () => {
          setShowCustomSlippage(false)
          setSlippage(bps)
        },
      })),
    [setSlippage]
  )

  const active = useMemo(
    () => SLIPPAGE_OPTIONS.findIndex((bps) => bps === selectedSlippage),
    [selectedSlippage]
  )

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
      <ButtonGroup buttons={buttons} startActive={active} />
      <ZapCustomInputSlippage
        showCustomSlippage={showCustomSlippage}
        setShowCustomSlippage={setShowCustomSlippage}
      />
    </Box>
  )
}

const ZapSettingsModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <Modal
      p={0}
      width={360}
      sx={{ border: '3px solid', borderColor: 'borderFocused' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          backgroundColor: 'backgroundNested',
        }}
      >
        <Box variant="layout.verticalAlign" p={4} mb={[3, 0]} pb={0}>
          <Text variant="sectionTitle">Zap Settings</Text>
          <Button
            variant="circle"
            onClick={onClose}
            sx={{ marginLeft: 'auto', backgroundColor: 'transparent' }}
          >
            <X />
          </Button>
        </Box>
        <Box
          p={['12px', '12px']}
          pt={0}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box>
            <Box
              variant="layout.verticalAlign"
              pl={'12px'}
              pr={4}
              py={2}
              sx={{ justifyContent: 'space-between' }}
            >
              <Text variant="legend">Collect dust?</Text>
              <Help
                content={`Dust is the leftover amount of tokens that cannot be exchanged. If you choose to collect dust, it will be sent back to your wallet. Sending dust back to the wallet will increase transaction fee.`}
              />
            </Box>
            <ZapCollectDust />
          </Box>
          <Box>
            <Box
              variant="layout.verticalAlign"
              pl={'12px'}
              pr={4}
              py={2}
              sx={{ justifyContent: 'space-between' }}
            >
              <Text variant="legend">Max. mint slippage</Text>
              <Help
                content={`The maximum amount of slippage you are willing to accept when minting. Higher slippage settings will make the transaction more likely to succeed, but may result in fewer tokens minted.`}
              />
            </Box>
            <ZapSlippageSettings />
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

const ZapSettings = () => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      {open && <ZapSettingsModal onClose={() => setOpen(false)} />}
      <IconButton
        sx={{
          cursor: 'pointer',
          width: '34px',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: '6px',
          ':hover': { backgroundColor: 'border' },
        }}
        onClick={() => setOpen(true)}
      >
        <Settings size={16} />
      </IconButton>
    </>
  )
}

const ZapTabs = () => {
  const [issuanceOperation, setZapOperation] = useState<string>('mint')
  const backingOptions = [
    { key: 'mint', label: 'Mint', icon: <Plus size={16} /> },
    { key: 'redeem', label: 'Redeem', icon: <Minus size={16} /> },
  ]

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ justifyContent: 'space-between' }}
    >
      <TabMenu
        mt={[3, 0]}
        active={issuanceOperation}
        items={backingOptions}
        small
        background="border"
        onMenuChange={setZapOperation}
      />
      <ZapSettings />
    </Box>
  )
}

const ZapTokenSelected = () => {
  const zapToken = useAtomValue(ui.input.tokenSelector.selectedToken)

  return (
    <TokenItem
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      symbol={zapToken?.symbol ?? 'ETH'}
      width={16}
    />
  )
}

const ZapTokenList = () => {
  const [tokens, setZapToken] = useAtom(ui.input.tokenSelector.tokenSelector)
  const entries = useMemo(
    () =>
      tokens.map((token) => ({
        token,
        selectToken: () => setZapToken(token),
      })),
    [setZapToken, tokens]
  )

  return (
    <Box
      sx={{
        background: 'background',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '140px',
        overflow: 'auto',
        borderRadius: '10px',
        gap: 2,
      }}
    >
      {entries.map(({ token, selectToken }) => (
        <Box
          p={2}
          key={token.symbol}
          sx={{
            cursor: 'pointer',
            ':hover': {
              backgroundColor: 'secondary',
            },
          }}
          onClick={selectToken}
        >
          <TokenItem symbol={token.symbol} />
        </Box>
      ))}
    </Box>
  )
}

const ZapTokenSelector = () => {
  const [isVisible, setVisible] = useAtom(ui.input.tokenSelector.popup)

  const onClickSelected = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation()
      setVisible((v) => !v)
    },
    [setVisible]
  )

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      placement="bottom"
      zIndex={0}
      content={<ZapTokenList />}
    >
      <Box
        variant="layout.verticalAlign"
        sx={{
          cursor: 'pointer',
          gap: 1,
        }}
        onMouseDown={onClickSelected}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{
            px: 2,
            py: 1,
            borderRadius: '4px',
            border: '1px solid',
            borderColor: 'border',
            backgroundColor: 'background',
            boxShadow: '0px 1px 8px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <ZapTokenSelected />
          {isVisible ? (
            <ChevronUp size={20} strokeWidth={1.8} />
          ) : (
            <ChevronDown size={20} strokeWidth={1.8} />
          )}
        </Box>
      </Box>
    </Popup>
  )
}

type ZapInputProps = {
  amount: string
  setAmount: (amount: string) => void
}

const ZapInput: FC<ZapInputProps> = ({ amount, setAmount }) => {
  const zapToken = useAtomValue(ui.input.tokenSelector.selectedToken)
  const symbol = useMemo(() => zapToken?.symbol ?? '', [zapToken])

  return (
    <Box sx={{ position: 'relative', zIndex: 0, width: '100%' }}>
      <NumericalInput
        variant="transparent"
        placeholder={`0 ${symbol}`}
        value={amount}
        onChange={setAmount}
      />
      {!!amount && (
        <Box
          sx={{
            fontSize: 4,
            fontWeight: 'bold',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        >
          <Text sx={{ visibility: 'hidden' }}>{amount}</Text>
          <Text sx={{ userSelect: 'none' }} ml="2" variant="legend">
            {symbol}
          </Text>
        </Box>
      )}
    </Box>
  )
}

const ZapMaxInputButton = () => {
  const setAmount = useSetAtom(zapInputString)
  const maxAmount = useAtomValue(ui.input.maxAmount)

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: '12px' }}>
      <Box>
        <Text>Balance </Text>
        <Text sx={{ fontWeight: 'bold' }}>{formatCurrency(+maxAmount, 5)}</Text>
      </Box>
      <Button
        small
        backgroundColor="#CCCCCC"
        color="#000000"
        style={{ borderRadius: 4 }}
        onClick={() => setAmount(maxAmount)}
      >
        Max
      </Button>
    </Box>
  )
}

const ZapInputAmountUSD = () => {
  const [amount] = useAtom(zapInputString)
  const zapToken = useAtomValue(ui.input.tokenSelector.selectedToken)
  const price = useChainlinkPrice(zapToken?.address as Address | undefined)

  const amountUSD = useMemo(() => {
    if (!price) return undefined
    return formatCurrency(Number(amount) * price, 2)
  }, [price, amount])

  if (!amountUSD) return <Skeleton width={100} height={20} />

  return <Text>${amountUSD}</Text>
}

const ZapInputContainer = () => {
  const [amount, setAmount] = useAtom(zapInputString)

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'lightGrey',
        borderRadius: '8px',
        gap: '8px',
        alignItems: 'start',
      }}
      p={3}
    >
      <Box
        variant="layout.centered"
        sx={{
          overflow: 'hidden',
          gap: '8px',
          alignItems: 'start',
          flexGrow: 1,
        }}
      >
        <Text>You use:</Text>
        <ZapInput amount={amount} setAmount={setAmount} />
        <ZapInputAmountUSD />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          height: '100%',
          top: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'end',
          justifyContent: 'space-between',
        }}
        p={3}
      >
        <ZapTokenSelector />
        <ZapMaxInputButton />
      </Box>
    </Box>
  )
}

const ZapOutput = () => {
  const zapPromise = useAtomValue(zapQuotePromise)
  const output = useAtomValue(zapOutputAmount)

  const loading = useMemo(() => zapPromise.state === 'loading', [zapPromise])

  // if (zapPromise.state === 'hasData' && zapPromise.data == null) {
  //   return ''
  // }

  // if (zapPromise.state === 'hasError') {
  //   return ''
  // }

  if (loading) {
    return <Skeleton height={30} width={38} />
  }

  return <Text variant="strong">{output}</Text>
}

const ZapOutputUSD = () => {
  const price = useAtomValue(rTokenPriceAtom)
  const output = useAtomValue(zapOutputAmount)
  const zapPromise = useAtomValue(zapQuotePromise)
  const loading = useMemo(() => zapPromise.state === 'loading', [zapPromise])
  const dustValue = useAtomValue(zapDustValue)

  const dust =
    dustValue == null || dustValue.total.amount < 10000n
      ? ''
      : formatQty(dustValue.total)

  if (loading) {
    return <Skeleton height={18} width={48} />
  }

  return (
    <Box>
      <Text
        variant="legend"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        ${formatCurrency(price * Number(output), 2)}
      </Text>
      {dust && (
        <Text>
          {' '}
          +{' '}
          <Text variant="legend" color="black">
            {dust}
          </Text>{' '}
          in dust
        </Text>
      )}
    </Box>
  )
}

const ZapOutputBalance = () => {
  const rToken = useRToken()
  const balance = useAtomValue(ui.input.maxRedeemAmount)

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
      {rToken?.symbol && <TokenLogo symbol={rToken.symbol} />}
      <Box>
        <Text>Balance </Text>
        <Text sx={{ fontWeight: 'bold' }}>{formatCurrency(+balance, 5)}</Text>
      </Box>
    </Box>
  )
}

const ZapOutputContainer = () => {
  const rToken = useRToken()

  return (
    <Box
      variant="layout.centered"
      sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: 'border',
        borderRadius: '8px',
        overflow: 'hidden',
        gap: '8px',
        alignItems: 'start',
      }}
      p={3}
    >
      <Text sx={{ display: 'block' }}>You receive:</Text>
      <Box
        variant="layout.verticalAlign"
        sx={{ fontSize: 4, fontWeight: 700, overflow: 'hidden' }}
      >
        <ZapOutput />
        <Text variant="legend" ml="2">
          {rToken?.symbol || ''}
        </Text>
      </Box>
      <Box variant="layout.verticalAlign">
        <ZapOutputUSD />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          height: '100%',
          top: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'end',
          justifyContent: 'end',
        }}
        p={3}
      >
        <ZapOutputBalance />
      </Box>
    </Box>
  )
}

const ZapOperationDetails: FC = () => {
  const rToken = useRToken()
  const price = useAtomValue(rTokenPriceAtom)

  return (
    <Box>
      {rToken?.symbol && (
        <Text>
          1 {rToken.symbol} = {formatCurrency(+price, 2)} USD
        </Text>
      )}
    </Box>
  )
}

const RTokenZapIssuance = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
        borderRadius: '14px',
        bg: 'background',
        boxShadow: '0px 10px 38px 6px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box p="24px">
        <ZapTabs />
      </Box>
      <Divider m={0} />
      <Box
        p="24px"
        sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ZapInputContainer />
          <Box variant="layout.verticalAlign" sx={{ gap: '12px', px: 3 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Box
              p="1"
              pb="0"
              sx={{
                border: '1px solid',
                borderColor: 'border',
                borderRadius: '6px',
                backgroundColor: 'lightGrey',
              }}
            >
              <ArrowDown size={24} strokeWidth={1.2} color="#666666" />
            </Box>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>
          <ZapOutputContainer />
        </Box>
        <ZapOperationDetails />
        <ZapButton />
      </Box>
    </Box>
  )
}

export default RTokenZapIssuance
