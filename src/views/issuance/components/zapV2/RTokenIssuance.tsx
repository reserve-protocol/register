import { NumericalInput } from 'components'
import TabMenu from 'components/tab-menu'
import { FC, useState } from 'react'
import { ArrowDown, Minus, Plus, Settings } from 'react-feather'
import { Box, Button, Divider, IconButton, Text } from 'theme-ui'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'

type ZapTabsProps = {
  symbol: string
}

const ZapTabs: FC<ZapTabsProps> = ({ symbol }) => {
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

type ZapInputProps = {
  symbol: string
  amount: string
  setAmount: (amount: string) => void
}

const ZapInput: FC<ZapInputProps> = ({ symbol, amount, setAmount }) => {
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
            RSR
          </Text>
        </Box>
      )}
    </Box>
  )
}

type ZapInputContainerProps = {
  symbol: string
  amount: string
  setAmount: (amount: string) => void
}

const ZapInputContainer: FC<ZapInputContainerProps> = ({
  symbol,
  amount,
  setAmount,
}) => {
  return (
    <Box
      variant="layout.centered"
      sx={{
        overflow: 'hidden',
        backgroundColor: 'lightGrey',
        borderRadius: '8px',
        gap: '8px',
        alignItems: 'start',
      }}
      p={3}
    >
      <Text>You use:</Text>
      <ZapInput symbol={symbol} amount={amount} setAmount={setAmount} />

      <Box variant="layout.verticalAlign">
        {/* <StakeUsdAmount /> */}
        {/* <StakeBalance /> */}
      </Box>
    </Box>
  )
}

type ZapOutputContainerProps = {
  inputSymbol: string
  outputSymbol: string
  amount: string
}

const ZapOutputContainer: FC<ZapOutputContainerProps> = ({
  inputSymbol,
  outputSymbol,
  amount,
}) => {
  const rate = 1
  const price = 1

  return (
    <Box
      variant="layout.centered"
      sx={{
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
        <Text>{amount ? formatCurrency(Number(amount) * rate) : '0'}</Text>
        <Text variant="legend" ml="2">
          {outputSymbol}
        </Text>
      </Box>
      <Box variant="layout.verticalAlign">
        <Text
          variant="legend"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          ${formatCurrency(price * Number(amount), 2)}
        </Text>
      </Box>
    </Box>
  )
}

const ZapOperationDetails: FC = () => {
  return <Box></Box>
}

type RTokenIssuanceProps = {
  rToken: ReserveToken
}

const RTokenIssuance: FC<RTokenIssuanceProps> = ({ rToken }) => {
  const [amount, setAmount] = useState<string>('')

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
        borderRadius: '14px',
        bg: 'background',
        border: '1px solid',
        borderColor: 'border',
      }}
    >
      <Box p="24px">
        <ZapTabs symbol={rToken.symbol} />
      </Box>
      <Divider m={0} />
      <Box
        p="24px"
        sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ZapInputContainer
            symbol={'USDC'}
            amount={amount}
            setAmount={setAmount}
          />
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
          <ZapOutputContainer
            inputSymbol={'USDC'}
            outputSymbol={rToken.symbol}
            amount={amount}
          />
        </Box>
        <ZapOperationDetails />
        <Button sx={{ width: '100%' }}>Zap mint</Button>
      </Box>
    </Box>
  )
}

export default RTokenIssuance
