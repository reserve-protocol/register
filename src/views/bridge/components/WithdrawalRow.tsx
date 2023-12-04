import GoTo from 'components/button/GoTo'
import { Box, Grid, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ChainId } from 'utils/chains'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { BridgeWithdraw } from '../hooks/useWithdrawals'

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

export default WithdrawalRow
