import TokenLogo from 'components/icons/TokenLogo'
import { borderRadius } from 'theme'
import { Box, Divider, Text } from 'theme-ui'
import { atom, useAtom, useAtomValue } from 'jotai'
import { stakeAmountAtom } from 'views/staking/atoms'
import { Button, NumericalInput } from 'components'
import {
  rTokenAtom,
  rTokenStateAtom,
  rsrBalanceAtom,
  rsrPriceAtom,
} from 'state/atoms'
import { formatCurrency } from 'utils'
import { ArrowDown } from 'react-feather'

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
    <NumericalInput
      variant="transparent"
      placeholder="0 RSR"
      value={amount as string}
      onChange={setAmount}
    />
  )
}

const StakeUsdAmount = () => {
  const price = useAtomValue(rsrPriceAtom)
  const amount = useAtomValue(stakeAmountAtom)

  if (!amount) {
    return null
  }

  return (
    <Text variant="legend">${formatCurrency(price * Number(amount), 2)}</Text>
  )
}

const StakeBalance = () => {
  const balance = useAtomValue(rsrBalanceAtom)

  return (
    <Box ml="auto" variant="layout.verticalAlign">
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
      <Button small variant="muted">
        Max
      </Button>
    </Box>
  )
}

const StakeInputContainer = () => {
  return (
    <Box
      sx={{ backgroundColor: 'lightGrey', borderRadius: borderRadius.boxes }}
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

const StakeOutputContainer = () => {
  const amount = useAtomValue(stakeAmountAtom)
  const rate = useAtomValue(rateAtom)
  const ticker = useAtomValue(stRsrTickerAtom)

  return (
    <Box
      p={3}
      sx={{
        border: '1px solid',
        borderColor: 'border',
        borderRadius: borderRadius.boxes,
      }}
    >
      <Text sx={{ display: 'block' }}>You receive:</Text>
      <Box variant="layout.verticalAlign" sx={{ fontSize: 4, fontWeight: 500 }}>
        <Text>{amount ? formatCurrency(Number(amount) * rate) : '0'}</Text>
        <Text variant="legend" ml="2">
          {ticker}
        </Text>
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
