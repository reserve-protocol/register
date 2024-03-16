import { Button, NumericalInput } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { rsrBalanceAtom, rsrPriceAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { stakeAmountAtom } from 'views/staking/atoms'
import InputPostfix from '../InputPostfix'

const StakeInputField = () => {
  const [amount, setAmount] = useAtom(stakeAmountAtom)

  useEffect(() => {
    return () => {
      setAmount('')
    }
  }, [])

  return (
    <Box sx={{ position: 'relative', zIndex: 0 }}>
      <NumericalInput
        variant="transparent"
        placeholder="0 RSR"
        value={amount}
        onChange={setAmount}
      />
      {!!amount && <InputPostfix amount={amount} symbol={'RSR'} />}
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

const StakeInput = () => (
  <Box
    sx={{
      overflow: 'hidden',
      backgroundColor: 'focusBox',
      borderRadius: borderRadius.boxes,
    }}
    p={3}
  >
    <Text>You stake:</Text>
    <StakeInputField />

    <Box variant="layout.verticalAlign">
      <StakeUsdAmount />
      <StakeBalance />
    </Box>
  </Box>
)

export default StakeInput
