import Help from 'components/help'
import DivaIcon from 'components/icons/DivaIcon'
import { useMemo } from 'react'
import { Box, Text } from 'theme-ui'
import { useZap } from '@/views/rtoken/issuance/components/zapV2/context/ZapContext'
import useDivaPoints from './hooks/useDivaPoints'
import { formatCurrency } from 'utils'

const DivaPointsMint = () => {
  const { rewardsRate } = useDivaPoints()
  const { amountOut, tokenOut } = useZap()

  const points = useMemo(() => {
    if (!tokenOut || !amountOut || tokenOut.symbol !== 'bsdETH') return 0
    return +(amountOut || 0) * rewardsRate
  }, [amountOut, tokenOut])

  if (!points || !amountOut || points < 0.005) return null

  return (
    <Box
      px={4}
      variant="layout.verticalAlign"
      sx={{ gap: 1, justifyContent: 'space-between' }}
    >
      <Box variant="layout.verticalAlign" sx={{ gap: 3 }}>
        <Box sx={{ display: ['none', 'flex'] }}>
          <DivaIcon />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Text color="diva" sx={{ fontWeight: 'bold' }}>
            Nektar Boost
          </Text>
          <Text>
            What {formatCurrency(+amountOut, 4)} bsdETH would award you
          </Text>
        </Box>
      </Box>
      <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
        <Text sx={{ fontWeight: 'bold' }}>
          <Text color="diva">{formatCurrency(points)} Nektar Drops </Text>
          per day
        </Text>
        <Help
          content={`Earn daily Diva Points based on the bsdETH you mint. Rewards are calculated at the current rate of ${rewardsRate} points per ETH per day and accrue daily.`}
          placement="right"
        />
      </Box>
    </Box>
  )
}

export default DivaPointsMint
