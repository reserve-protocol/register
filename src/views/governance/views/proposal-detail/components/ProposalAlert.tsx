import SpinnerIcon from 'components/icons/SpinnerIcon'
import { useAtomValue } from 'jotai'
import { Check, Slash, X } from 'react-feather'
import { Box, Text } from 'theme-ui'
import { parseDurationShort } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { getProposalStateAtom } from '../atom'
import { ReactNode } from 'react'

const FinalState = ({
  label,
  color,
  bgColor,
  icon,
}: {
  label: string
  color: string
  bgColor: string
  icon: ReactNode
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
        {icon}
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
    icon: <Check size={20} />,
  },
  [PROPOSAL_STATES.DEFEATED]: {
    label: 'Defeated',
    color: 'red',
    bgColor: 'rgba(208, 90, 103, 0.10)',
    icon: <X size={20} />,
  },
  [PROPOSAL_STATES.EXPIRED]: {
    label: 'Expired',
    color: 'gray',
    bgColor: 'rgba(0, 0, 0, 0.10)',
    icon: <Slash size={20} />,
  },
  [PROPOSAL_STATES.CANCELED]: {
    label: 'Canceled',
    color: 'red',
    bgColor: 'rgba(208, 90, 103, 0.10)',
    icon: <X size={20} />,
  },
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: {
    label: 'Quorum not reached',
    color: 'orange',
    bgColor: 'rgba(255, 152, 0, 0.10)',
    icon: <X size={20} />,
  },
  [PROPOSAL_STATES.SUCCEEDED]: {
    label: 'Succeeded',
    color: 'green',
    bgColor: 'rgba(0, 255, 152, 0.10)',
    icon: <Check size={20} />,
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
        icon={FINAL_STATES[state.state].icon}
      />
    )
  }

  const deadline = parseDurationShort(Math.max(state.deadline || 0, 0), {
    units: ['d', 'h', 'm'],
    round: true,
  })

  if (!Object.keys(DEADLINE_STATES).includes(state.state)) {
    return null
  }

  if (
    state.state === PROPOSAL_STATES.QUEUED &&
    (!state.deadline || state.deadline <= 0)
  ) {
    return (
      <FinalState
        label="Passed"
        color="primary"
        bgColor="rgba(9, 85, 172, 0.10)"
        icon={<Check size={20} />}
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
