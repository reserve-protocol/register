import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { rsrBalanceAtom, rsrPriceAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { rateAtom } from '@/views/yield-dtf/staking/atoms'
import { unStakeAmountAtom } from './atoms'

const RsrBalance = () => {
  const balance = useAtomValue(rsrBalanceAtom)

  return (
    <Box ml="auto" variant="layout.verticalAlign" sx={{ flexShrink: 0 }}>
      <TokenLogo width={16} symbol="rsr" />
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

const UnstakeOutput = () => {
  const amount = useAtomValue(unStakeAmountAtom)
  const rate = useAtomValue(rateAtom)
  const price = useAtomValue(rsrPriceAtom)

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
        <Text>{amount ? formatCurrency(Number(amount) * rate) : '0'}</Text>
        <Text variant="legend" ml="2">
          RSR
        </Text>
      </Box>
      <Box variant="layout.verticalAlign">
        <Text
          variant="legend"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          ${formatCurrency(price * (Number(amount) * rate), 2)}
        </Text>
        <RsrBalance />
      </Box>
    </Box>
  )
}

export default UnstakeOutput
