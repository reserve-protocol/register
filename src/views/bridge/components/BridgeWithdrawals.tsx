import { Trans, t } from '@lingui/macro'
import TablePlaceholder from '@/components/old/table/components/TablePlaceholder'
import Skeleton from 'react-loading-skeleton'
import { Box, Grid, Text } from 'theme-ui'
import { useBlockNumberOfLatestL2OutputProposal } from '../hooks/useWithdrawStatus'
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
  const blockNumberOfLatestL2OutputProposal =
    useBlockNumberOfLatestL2OutputProposal()

  return (
    <Box variant="layout.wrapper" p={4} mt={[2, 7]}>
      <Text ml={4} variant="sectionTitle" mb={[2, 6]}>
        <Trans>Withdrawal Transactions</Trans>
      </Text>
      <TableHeader />
      <Box sx={{ maxHeight: 1524, overflow: 'auto' }}>
        {!!data?.length &&
          !isLoading &&
          data.map((withdrawal) => (
            <WithdrawalRow
              data={withdrawal}
              key={withdrawal.hash}
              blockNumberOfLatestL2OutputProposal={
                blockNumberOfLatestL2OutputProposal
              }
            />
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
