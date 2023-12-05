import { Box, Text } from 'theme-ui'
import { WithdrawalPhase } from '../utils/types'

const PHASE_MAP: Record<WithdrawalPhase, number> = {
  PROPOSING_ON_CHAIN: 0,
  PROVE: 1,
  PROVE_TX_PENDING: 1,
  PROVE_TX_FAILURE: 1,
  CHALLENGE_WINDOW: 1,
  FINALIZE: 2,
  FINALIZE_TX_PENDING: 2,
  FINALIZE_TX_FAILURE: 2,
  FUNDS_WITHDRAWN: 3,
}

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

const items = new Array(4).fill(0)

const PhaseStatus = ({ phase }: { phase: WithdrawalPhase }) => {
  const selected = PHASE_MAP[phase]

  return (
    <Box>
      <Box variant="layout.verticalAlign" mb={2}>
        {items.map((_, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: index === selected ? 'primary' : 'muted',
              flexGrow: 1,
              height: '3px',
              borderRadius: 12,
            }}
            mr={2}
          />
        ))}
      </Box>
      <Text variant="legend" sx={{ fontSize: 1 }}>
        {withdrawalPhaseText[phase]}
      </Text>
    </Box>
  )
}

export default PhaseStatus
