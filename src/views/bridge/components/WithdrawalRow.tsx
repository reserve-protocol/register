import GoTo from 'components/button/GoTo'
import AlertIcon from 'components/icons/AlertIcon'
import CheckCircleIcon from 'components/icons/CheckCircleIcon'
import ClockIcon from 'components/icons/ClockIcon'
import dayjs from 'dayjs'
import { Box, Flex, Grid, Text } from 'theme-ui'
import { parseDuration, shortenString } from 'utils'
import { ChainId } from 'utils/chains'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import useWithdrawalStatus from '../hooks/useWithdrawStatus'
import { BridgeWithdraw } from '../hooks/useWithdrawals'
import { WithdrawalPhase } from '../utils/types'
import { FinalizeWithdrawalButton } from './FinalizeWithdrawalButton'
import PhaseStatus from './PhaseStatus'
import { ProveWithdrawalButton } from './ProveWithdrawalButton'

const PHASE_ICON: Record<WithdrawalPhase, React.FunctionComponent> = {
  PROPOSING_ON_CHAIN: ClockIcon,
  PROVE: AlertIcon,
  CHALLENGE_WINDOW: ClockIcon,
  FINALIZE: AlertIcon,
  FUNDS_WITHDRAWN: CheckCircleIcon,
}

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

const TxHash = ({ hash }: { hash: string }) => (
  <Box variant="layout.verticalAlign">
    <Text mr={2}>{shortenString(hash)}</Text>
    <GoTo
      href={getExplorerLink(hash, ChainId.Base, ExplorerDataType.TRANSACTION)}
    />
  </Box>
)

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
      <Box
        variant="layout.verticalAlign"
        pb={[3, 0]}
        sx={{ borderBottom: ['1px solid', 'none'], borderColor: 'darkBorder' }}
      >
        {(() => {
          const Icon = PHASE_ICON[withdrawalStatus]
          return <Icon />
        })()}
        <Flex
          ml="3"
          sx={{
            flexDirection: ['row', 'column'],
            flexGrow: 1,
          }}
        >
          <Text sx={{ display: 'block', fontSize: 2 }}>{data.date}</Text>
          <Text
            ml={['auto', 0]}
            sx={{ fontSize: [2, 1], display: 'block' }}
            variant="legend"
          >
            {data.time}
          </Text>
        </Flex>
      </Box>
      <Box sx={{ display: ['none', 'block'] }}>
        <TxHash hash={data.hash} />
      </Box>
      <Box variant="layout.verticalAlign" mb={[2, 0]}>
        <Text>
          {data.formattedAmount} {data.symbol}
        </Text>
        <Box sx={{ display: ['block', 'none'] }} ml="auto">
          <TxHash hash={data.hash} />
        </Box>
      </Box>
      <PhaseStatus phase={withdrawalStatus} />
      <Box sx={{ textAlign: 'right' }}>{PHASE_TO_STATUS[withdrawalStatus]}</Box>
    </Grid>
  )
}

export default WithdrawalRow
