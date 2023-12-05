import GoTo from 'components/button/GoTo'
import { useState } from 'react'
import { Box, Grid, Text } from 'theme-ui'
import { parseDuration, shortenString } from 'utils'
import { ChainId } from 'utils/chains'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import useWithdrawalStatus from '../hooks/useWithdrawStatus'
import { BridgeWithdraw } from '../hooks/useWithdrawals'
import dayjs from 'dayjs'
import { ProveWithdrawalButton } from './ProveWithdrawalButton'

const withdrawalPhaseText = {
  PROPOSING_ON_CHAIN: 'Proposing onchain',
  PROVE: 'Ready to verify',
  PROVE_TX_PENDING: 'Ready to verify',
  PROVE_TX_FAILURE: 'Ready to verify',
  CHALLENGE_WINDOW: 'Verifying',
  FINALIZE: 'Ready to complete',
  FINALIZE_TX_PENDING: 'Processing',
  FINALIZE_TX_FAILURE: 'Processing',
  FUNDS_WITHDRAWN: 'Funds moved',
}

const withdrawalPhaseStatusText = {
  PROPOSING_ON_CHAIN: 'Wait up to 1 hr',
  PROVE: '',
  PROVE_TX_PENDING: '',
  PROVE_TX_FAILURE: 'Failed',
  CHALLENGE_WINDOW: (challengeWindowEndTime?: number) =>
    challengeWindowEndTime &&
    `Wait ${parseDuration(challengeWindowEndTime - dayjs().unix(), {
      units: ['d'],
      round: true,
    })}`,
  FINALIZE: '',
  FINALIZE_TX_PENDING: '',
  FINALIZE_TX_FAILURE: 'Failed',
  FUNDS_WITHDRAWN: 'Complete',
}

const WithdrawalRow = ({
  data,
  blockNumberOfLatestL2OutputProposal,
}: {
  data: BridgeWithdraw
  blockNumberOfLatestL2OutputProposal?: bigint
}) => {
  const [proveTxHash, setProveTxHash] = useState<`0x${string}` | undefined>(
    undefined
  )
  const [finalizeTxHash, setFinalizeTxHash] = useState<
    `0x${string}` | undefined
  >(undefined)
  const { status: withdrawalStatus, challengeWindowEndTime } =
    useWithdrawalStatus({
      initializeTxHash: data.hash,
      blockNumberOfLatestL2OutputProposal,
      proveTxHash,
      finalizeTxHash,
    })

  const PHASE_TO_STATUS = {
    PROPOSING_ON_CHAIN: withdrawalPhaseStatusText.PROPOSING_ON_CHAIN,
    PROVE: (
      <ProveWithdrawalButton
        txHash={data.hash}
        setProveTxHash={setProveTxHash}
        blockNumberOfLatestL2OutputProposal={
          blockNumberOfLatestL2OutputProposal
        }
      />
    ),
    PROVE_TX_PENDING: 'Pending btn',
    PROVE_TX_FAILURE: withdrawalPhaseStatusText.PROVE_TX_FAILURE,
    CHALLENGE_WINDOW: withdrawalPhaseStatusText.CHALLENGE_WINDOW(
      Number(challengeWindowEndTime)
    ),
    FINALIZE: 'Finalize btn',
    // <FinalizeWithdrawalButton
    //   txHash={transaction.hash}
    //   onOpenFinalizeWithdrawalModal={onOpenFinalizeWithdrawalModal}
    //   onCloseFinalizeWithdrawalModal={onCloseFinalizeWithdrawalModal}
    //   setFinalizeTxHash={setFinalizeTxHash}
    //   setModalFinalizeTxHash={setModalFinalizeTxHash}
    // />
    FINALIZE_TX_PENDING: 'Pending btn',
    FINALIZE_TX_FAILURE: withdrawalPhaseStatusText.FINALIZE_TX_FAILURE,
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
      <Box sx={{ textAlign: 'right' }}>{PHASE_TO_STATUS[withdrawalStatus]}</Box>
    </Grid>
  )
}

export default WithdrawalRow
