import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { stRsrBalanceAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { stRsrTickerAtom } from 'views/staking/atoms'
import { stakeAmountUsdAtom, stakeOutputAtom } from './atoms'

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

const StakeOutput = () => {
  const ticker = useAtomValue(stRsrTickerAtom)
  const stAmount = useAtomValue(stakeOutputAtom)
  const usdAmount = useAtomValue(stakeAmountUsdAtom)

  return (
    <Box
      p={3}
      sx={{
        border: '1px solid',
        borderColor: 'borderSecondary',
        borderRadius: borderRadius.boxes,
        overflow: 'hidden',
      }}
    >
      <Text sx={{ display: 'block' }}>You receive:</Text>
      <Box
        variant="layout.verticalAlign"
        sx={{ fontSize: 4, fontWeight: 700, overflow: 'hidden' }}
      >
        <Text>{formatCurrency(stAmount)}</Text>
        <Text variant="legend" ml="2">
          {ticker}
        </Text>
      </Box>
      <Box variant="layout.verticalAlign">
        <Text
          variant="legend"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          ${formatCurrency(usdAmount, 2)}
        </Text>
        <StRsrBalance />
      </Box>
    </Box>
  )
}

export default StakeOutput
