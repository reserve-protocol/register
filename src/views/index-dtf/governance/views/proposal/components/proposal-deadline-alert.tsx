import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { Check, Slash, X } from 'lucide-react'
import { Box, Spinner, Text } from 'theme-ui'
import { parseDurationShort } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { proposalDetailAtom } from '../atom'

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
    <div
      className="flex flex-col items-center justify-center gap-2 h-full"
      style={{ color }}
    >
      <div
        className="flex items-center justify-center rounded-full p-2"
        style={{ background: bgColor }}
      >
        {icon}
      </div>
      <span className="text-lg font-bold">{label}</span>
    </div>
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
    color: 'orange',
  },
}

const ProposalAlert = () => {
  const state = useAtomValue(proposalDetailAtom)?.votingState

  if (!state) return null

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
    <div
      className="flex flex-col items-center justify-center h-full py-4"
      style={{ color: DEADLINE_STATES[state.state].color }}
    >
      <Spinner size={18} color={DEADLINE_STATES[state.state].color} />
      <p className="text-sm mt-1">{DEADLINE_STATES[state.state].text}</p>
      <p className="font-bold">{deadline}</p>
    </div>
  )
}

export default ProposalAlert
