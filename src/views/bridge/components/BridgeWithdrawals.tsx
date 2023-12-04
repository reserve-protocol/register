import { Trans, t } from '@lingui/macro'
import TablePlaceholder from 'components/table/components/TablePlaceholder'
import Skeleton from 'react-loading-skeleton'
import { Box, Grid, Text } from 'theme-ui'
import useWithdrawals from '../hooks/useWithdrawals'
import WithdrawalRow from './WithdrawalRow'

const TableHeader = () => (
  <Grid
    columns="1fr 1fr 1fr 1fr 1fr"
    px={4}
    sx={{ display: ['none', 'grid'], color: 'secondaryText' }}
  >
    <Text>
      <Trans>Time</Trans>
    </Text>
    <Text>
      <Trans>Type</Trans>
    </Text>
    <Text>
      <Trans>Amount</Trans>
    </Text>
    <Text>
      <Trans>Phase</Trans>
    </Text>
    <Text sx={{ textAlign: 'right' }}>
      <Trans>Status</Trans>
    </Text>
  </Grid>
)

const BridgeWithdrawals = () => {
  const { data, isLoading } = useWithdrawals()

  return (
    <Box p={4} mt={7}>
      <Text ml={4} variant="sectionTitle" mb={6}>
        <Trans>Withdrawal Transactions</Trans>
      </Text>
      <TableHeader />
      <Box sx={{ maxHeight: 1024, overflow: 'auto' }}>
        {!!data?.length &&
          !isLoading &&
          data.map((withdrawal) => (
            <WithdrawalRow data={withdrawal} key={withdrawal.hash} />
          ))}
      </Box>

      {!data?.length && !isLoading && (
        <TablePlaceholder
          text={t`No withdrawals found for connected wallet.`}
        />
      )}
      {isLoading && (
        <Skeleton height={80} count={3} style={{ marginTop: 20 }} />
      )}
    </Box>
  )
}

export default BridgeWithdrawals
