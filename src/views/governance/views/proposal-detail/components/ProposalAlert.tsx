import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Check } from 'react-feather'
import { Box, Image, Text } from 'theme-ui'
import { parseDuration, parseDurationShort } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { getProposalStateAtom } from '../atom'
import SpinnerIcon from 'components/icons/SpinnerIcon'

const FinalState = ({
  label,
  color,
  bgColor,
}: {
  label: string
  color: string
  bgColor: string
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: '100%',
        color,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgColor,
          borderRadius: '50%',
          padding: '8px',
        }}
      >
        <Check size={20} />
      </Box>
      <Text sx={{ fontSize: 3, fontWeight: 'bold' }}>{label}</Text>
    </Box>
  )
}

const FINAL_STATES = {
  [PROPOSAL_STATES.EXECUTED]: {
    label: 'Executed',
    color: 'primary',
    bgColor: 'rgba(9, 85, 172, 0.10)',
  },
  [PROPOSAL_STATES.DEFEATED]: {
    label: 'Defeated',
    color: 'red',
    bgColor: 'rgba(208, 90, 103, 0.10)',
  },
  [PROPOSAL_STATES.EXPIRED]: {
    label: 'Expired',
    color: 'gray',
    bgColor: 'rgba(0, 0, 0, 0.10)',
  },
  [PROPOSAL_STATES.CANCELED]: {
    label: 'Canceled',
    color: 'red',
    bgColor: 'rgba(208, 90, 103, 0.10)',
  },
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: {
    label: 'Quorum not reached',
    color: 'orange',
    bgColor: 'rgba(255, 152, 0, 0.10)',
  },
  [PROPOSAL_STATES.SUCCEEDED]: {
    label: 'Succeeded',
    color: 'green',
    bgColor: 'rgba(0, 255, 152, 0.10)',
  },
}

const DEADLINE_STATES = {
  [PROPOSAL_STATES.ACTIVE]: {
    text: 'Voting period ends in',
    color: 'accentInverted',
  },
  [PROPOSAL_STATES.PENDING]: {
    text: 'Voting begins in',
    color: 'accentInverted',
  },
  [PROPOSAL_STATES.QUEUED]: {
    text: 'Execution delay ends in',
    color: 'red',
  },
}

const ProposalAlert = () => {
  const state = useAtomValue(getProposalStateAtom)

  if (Object.keys(FINAL_STATES).includes(state.state)) {
    return (
      <FinalState
        label={FINAL_STATES[state.state].label}
        color={FINAL_STATES[state.state].color}
        bgColor={FINAL_STATES[state.state].bgColor}
      />
    )
  }

  const deadline = parseDurationShort(Math.max(state.deadline || 0, 0), {
    units: ['d', 'h', 'm'],
    round: true,
  })

  if (
    state.state === PROPOSAL_STATES.QUEUED &&
    (!state.deadline || state.deadline <= 0)
  ) {
    return (
      <FinalState
        label="Passed"
        color="primary"
        bgColor="rgba(9, 85, 172, 0.10)"
      />
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: DEADLINE_STATES[state.state].color,
        height: '100%',
      }}
    >
      <SpinnerIcon />
      <Text sx={{ fontSize: 1, mt: 1 }}>
        {DEADLINE_STATES[state.state].text}
      </Text>
      <Text variant="title" sx={{ fontWeight: 'bold' }}>
        {deadline}
      </Text>
    </Box>
  )
}

export default ProposalAlert
