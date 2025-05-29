import { Trans } from '@lingui/macro'
import { Suspense, lazy } from 'react'
import { TrendingUp } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { Box, Card, Text } from 'theme-ui'

const Charts = lazy(() => import('./charts'))

const HistoricalMetrics = () => (
  <Box>
    <Box
      variant="layout.verticalAlign"
      ml="4"
      mb={3}
      mt={6}
      sx={{ color: 'accent' }}
    >
      <TrendingUp />
      <Text ml="3" as="h2" variant="title" sx={{ fontWeight: '400' }}>
        <Trans>Historical metrics</Trans>
      </Text>
    </Box>
    <Card mt="5" p="1">
      <Suspense fallback={<Skeleton count={3} height={160} />}>
        <Charts />
      </Suspense>
    </Card>
  </Box>
)

export default HistoricalMetrics
