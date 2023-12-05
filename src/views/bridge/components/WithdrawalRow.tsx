import GoTo from 'components/button/GoTo'
import dayjs from 'dayjs'
import { Box, Grid, Text } from 'theme-ui'
import { parseDuration, shortenString } from 'utils'
import { ChainId } from 'utils/chains'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import useWithdrawalStatus from '../hooks/useWithdrawStatus'
import { BridgeWithdraw } from '../hooks/useWithdrawals'
import { FinalizeWithdrawalButton } from './FinalizeWithdrawalButton'
import PhaseStatus from './PhaseStatus'
import { ProveWithdrawalButton } from './ProveWithdrawalButton'

const withdrawalPhaseStatusText = {
  PROPOSING_ON_CHAIN: 'Wait up to 1 hr',
  PROVE: '',
  CHALLENGE_WINDOW: (challengeWindowEndTime?: number) =>
    challengeWindowEndTime &&
    `Wait ${parseDuration(challengeWindowEndTime - dayjs().unix(), {
      units: ['d'],
      round: true,
    })}`,
  FINALIZE: '',
  FUNDS_WITHDRAWN: 'Complete',
}

const WithdrawalRow = ({
  data,
  blockNumberOfLatestL2OutputProposal,
}: {
  data: BridgeWithdraw
  blockNumberOfLatestL2OutputProposal?: bigint
}) => {
  const { status: withdrawalStatus, challengeWindowEndTime } =
    useWithdrawalStatus({
      initializeTxHash: data.hash,
      blockNumberOfLatestL2OutputProposal,
    })

  const PHASE_TO_STATUS = {
    PROPOSING_ON_CHAIN: withdrawalPhaseStatusText.PROPOSING_ON_CHAIN,
    PROVE: (
      <ProveWithdrawalButton
        txHash={data.hash}
        blockNumberOfLatestL2OutputProposal={
          blockNumberOfLatestL2OutputProposal
        }
      />
    ),
    CHALLENGE_WINDOW: withdrawalPhaseStatusText.CHALLENGE_WINDOW(
      Number(challengeWindowEndTime)
    ),
    FINALIZE: <FinalizeWithdrawalButton txHash={data.hash} />,
    FUNDS_WITHDRAWN: withdrawalPhaseStatusText.FUNDS_WITHDRAWN,
  }
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
      <Box variant="layout.verticalAlign">
        <Box>
          <Text sx={{ display: 'block', fontSize: 2 }} mb={2}>
            {data.date}
          </Text>
          <Text sx={{ fontSize: 1 }} variant="legend">
            {data.time}
          </Text>
        </Box>
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
      <PhaseStatus phase={withdrawalStatus} />
      <Box sx={{ textAlign: 'right' }}>{PHASE_TO_STATUS[withdrawalStatus]}</Box>
    </Grid>
  )
}

export default WithdrawalRow
