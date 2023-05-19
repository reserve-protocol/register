import { useAtomValue } from 'jotai'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { accumulatedRevenueAtom } from '../atoms'

const RevenueOverview = () => {
  const revenue = useAtomValue(accumulatedRevenueAtom)

  return (
    <Box variant="layout.borderBox" p={3} m={4} mb={0}>
      <Box variant="layout.verticalAlign">
        <Text>Current accumulated revenue</Text>
        <Text ml="auto">${formatCurrency(revenue || 0)}</Text>
      </Box>
    </Box>
  )
}

export default RevenueOverview
