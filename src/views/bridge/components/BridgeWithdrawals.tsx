import { Trans, t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import GoTo from 'components/button/GoTo'
import { useMemo } from 'react'
import { Box, Grid, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ChainId } from 'utils/chains'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import useWithdrawals, { BridgeWithdraw } from '../hooks/useWithdrawals'
import TablePlaceholder from 'components/table/components/TablePlaceholder'
import Skeleton from 'react-loading-skeleton'

const WithdrawalRow = ({ data }: { data: BridgeWithdraw }) => {
  return (
    <Grid
      columns={['1fr', '1fr 1fr 1fr 1fr 1fr']}
      sx={{
        backgroundColor: 'contentBackground',
        position: 'relative',
        borderRadius: 20,
        alignItems: 'center',
      }}
      mt={3}
      p={4}
    >
      <Box>
        <Text sx={{ display: 'block', fontSize: 2 }} mb={2}>
          {data.date}
        </Text>
        <Text sx={{ fontSize: 1 }} variant="legend">
          {data.time}
        </Text>
      </Box>
      <Box variant="layout.verticalAlign">
        <Text mr={2}>{shortenString(data.hash)}</Text>
        <GoTo
          href={getExplorerLink(
            data.hash,
            ChainId.Base,
            ExplorerDataType.TRANSACTION
          )}
        />
      </Box>
      <Box>
        <Text>
          {data.formattedAmount} {data.symbol}
        </Text>
      </Box>
      <Box>Phase</Box>
      <Box sx={{ textAlign: 'right' }}>Status</Box>
    </Grid>
  )
}

const TableHeader = () => (
  <Grid
    columns="1fr 1fr 1fr 1fr 1fr"
    px={4}
    sx={{ display: ['none', 'grid'], color: 'secondaryText' }}
  >
    <Text>Time</Text>
    <Text>Type</Text>
    <Text>Amount</Text>
    <Text>Phase</Text>
    <Text sx={{ textAlign: 'right' }}>Status</Text>
  </Grid>
)

const BridgeWithdrawals = () => {
  const { data, isLoading } = useWithdrawals()

  return (
    <Box p={4}>
      <Text ml={4} variant="sectionTitle" mb={6}>
        <Trans>Withdrawal Transactions</Trans>
      </Text>
      <TableHeader />

      {!!data?.length &&
        !isLoading &&
        data.map((withdrawal) => (
          <WithdrawalRow data={withdrawal} key={withdrawal.hash} />
        ))}
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
