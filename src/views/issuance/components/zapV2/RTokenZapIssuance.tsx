import { Button, NumericalInput } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import Popup from 'components/popup'
import TabMenu from 'components/tab-menu'
import TokenItem from 'components/token-item'
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
} from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { rTokenPriceAtom } from 'state/atoms'
import { Box, Divider, IconButton, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { zapInputString, zapQuotePromise } from '../zap/state/atoms'
import { formatQty } from '../zap/state/formatTokenQuantity'
import { ui, zapDustValue, zapOutputAmount } from '../zap/state/ui-atoms'
import ZapButton from '../zap/components/ZapButton'

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
      <IconButton
        sx={{
          cursor: 'pointer',
          width: '34px',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: '6px',
          ':hover': { backgroundColor: 'border' },
        }}
      >
        <Settings size={16} />
      </IconButton>
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
        <Text>$1000000</Text>
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
