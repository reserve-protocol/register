import { Button, NumericalInput } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { rsrPriceAtom, stRsrBalanceAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { rateAtom, stRsrTickerAtom } from '@/views/rtoken/staking/atoms'
import InputPostfix from '../InputPostfix'
import { unStakeAmountAtom } from './atoms'

const UnstakeInputField = () => {
  const [amount, setAmount] = useAtom(unStakeAmountAtom)
  const ticker = useAtomValue(stRsrTickerAtom)

  useEffect(() => {
    return () => {
      setAmount('')
    }
  }, [])

  return (
    <Box sx={{ position: 'relative', zIndex: 0 }}>
      <NumericalInput
        variant="transparent"
        placeholder={`0 ${ticker}`}
        value={amount}
        onChange={setAmount}
      />
      {!!amount && <InputPostfix amount={amount} symbol={ticker} />}
    </Box>
  )
}

const UnstakeUsdAmount = () => {
  const price = useAtomValue(rsrPriceAtom)
  const amount = useAtomValue(unStakeAmountAtom)
  const rate = useAtomValue(rateAtom)

  if (!amount) {
    return null
  }

  return (
    <Text
      mr="3"
      sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      variant="legend"
    >
      ${formatCurrency(price * (Number(amount) * rate), 2)}
    </Text>
  )
}

const UnstakeBalance = () => {
  const balance = useAtomValue(stRsrBalanceAtom)
  const setAmount = useSetAtom(unStakeAmountAtom)

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
      <Button small variant="muted" onClick={() => setAmount(balance.balance)}>
        Max
      </Button>
    </Box>
  )
}

const UnstakeInput = () => (
  <Box
    sx={{
      overflow: 'hidden',
      backgroundColor: 'focusBox',
      borderRadius: borderRadius.boxes,
    }}
    p={3}
  >
    <Text>You unstake:</Text>
    <UnstakeInputField />

    <Box variant="layout.verticalAlign">
      <UnstakeUsdAmount />
      <UnstakeBalance />
    </Box>
  </Box>
)

export default UnstakeInput
