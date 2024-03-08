import { Button, NumericalInput } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowDown } from 'react-feather'
import {
  rTokenAtom,
  rTokenStateAtom,
  rsrBalanceAtom,
  rsrPriceAtom,
  stRsrBalanceAtom,
} from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Divider, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { stakeAmountAtom } from 'views/staking/atoms'

const rateAtom = atom((get) => {
  const { exchangeRate } = get(rTokenStateAtom)

  return exchangeRate
})

const stRsrTickerAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  return rToken?.stToken?.symbol ?? 'stRSR'
})

const StakeInput = () => {
  const [amount, setAmount] = useAtom(stakeAmountAtom)

  return (
    <Box sx={{ position: 'relative', zIndex: 0 }}>
      <NumericalInput
        variant="transparent"
        placeholder="0 RSR"
        value={amount as string}
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

const StakeUsdAmount = () => {
  const price = useAtomValue(rsrPriceAtom)
  const amount = useAtomValue(stakeAmountAtom)

  if (!amount) {
    return null
  }

  return (
    <Text
      mr="3"
      sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      variant="legend"
    >
      ${formatCurrency(price * Number(amount), 2)}
    </Text>
  )
}

const StakeBalance = () => {
  const balance = useAtomValue(rsrBalanceAtom)
  const setAmount = useSetAtom(stakeAmountAtom)

  return (
    <Box ml="auto" variant="layout.verticalAlign" sx={{ flexShrink: 0 }}>
      <TokenLogo width={16} symbol={'rsr'} />
      <Text ml="2" variant="legend">
        Balance
      </Text>
      <Text variant="strong" mx="1">
        {formatCurrency(+balance.balance, 2, {
          notation: 'compact',
          compactDisplay: 'short',
        })}
      </Text>
      <Button small variant="muted" onClick={() => setAmount(balance.balance)}>
        Max
      </Button>
    </Box>
  )
}

const StakeInputContainer = () => {
  return (
    <Box
      sx={{
        overflow: 'hidden',
        backgroundColor: 'lightGrey',
        borderRadius: borderRadius.boxes,
      }}
      p={3}
    >
      <Text>You stake:</Text>
      <StakeInput />

      <Box variant="layout.verticalAlign">
        <StakeUsdAmount />
        <StakeBalance />
      </Box>
    </Box>
  )
}

const StRsrBalance = () => {
  const balance = useAtomValue(stRsrBalanceAtom)

  return (
    <Box ml="auto" variant="layout.verticalAlign" sx={{ flexShrink: 0 }}>
      <TokenLogo width={16} src="/svgs/strsr.svg" />
      <Text ml="2" variant="legend">
        Balance
      </Text>
      <Text variant="strong" mx="1">
        {formatCurrency(+balance.balance, 2, {
          notation: 'compact',
          compactDisplay: 'short',
        })}
      </Text>
    </Box>
  )
}

const StakeOutputContainer = () => {
  const amount = useAtomValue(stakeAmountAtom)
  const rate = useAtomValue(rateAtom)
  const ticker = useAtomValue(stRsrTickerAtom)
  const price = useAtomValue(rsrPriceAtom)

  return (
    <Box
      p={3}
      sx={{
        border: '1px solid',
        borderColor: 'border',
        borderRadius: borderRadius.boxes,
        overflow: 'hidden',
      }}
    >
      <Text sx={{ display: 'block' }}>You receive:</Text>
      <Box
        variant="layout.verticalAlign"
        sx={{ fontSize: 4, fontWeight: 700, overflow: 'hidden' }}
      >
        <Text>{amount ? formatCurrency(Number(amount) * rate) : '0'}</Text>
        <Text variant="legend" ml="2">
          {ticker}
        </Text>
      </Box>
      <Box variant="layout.verticalAlign">
        <Text
          variant="legend"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          ${formatCurrency(price * Number(amount), 2)}
        </Text>
        <StRsrBalance />
      </Box>
    </Box>
  )
}

const Stake = () => {
  return (
    <Box p={4}>
      <StakeInputContainer />
      <Box variant="layout.verticalAlign">
        <Divider sx={{ flexGrow: 1, borderColor: 'border' }} />
        <Box
          mx={4}
          my={2}
          p="1"
          pb="0"
          sx={{
            border: '1px solid',
            borderColor: 'border',
            borderRadius: borderRadius.inputs,
          }}
        >
          <ArrowDown size={24} color="#666666" />
        </Box>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>
      <StakeOutputContainer />
    </Box>
  )
}

export default Stake
