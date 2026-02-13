import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { Check, Slash, X } from 'lucide-react'
import { parseDurationShort } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { getProposalStateAtom } from '../atom'
import Spinner from '@/components/ui/spinner'

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
      className="flex h-full flex-col items-center justify-center gap-2"
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

const FINAL_STATES: Record<
  string,
  { label: string; color: string; bgColor: string; icon: ReactNode }
> = {
  [PROPOSAL_STATES.EXECUTED]: {
    label: 'Executed',
    color: 'var(--primary)',
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

const DEADLINE_STATES: Record<string, { text: string; color: string }> = {
  [PROPOSAL_STATES.ACTIVE]: {
    text: 'Voting period ends in',
    color: 'var(--accent-inverted)',
  },
  [PROPOSAL_STATES.PENDING]: {
    text: 'Voting begins in',
    color: 'var(--accent-inverted)',
  },
  [PROPOSAL_STATES.QUEUED]: {
    text: 'Execution delay ends in',
    color: 'orange',
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
        color="var(--primary)"
        bgColor="rgba(9, 85, 172, 0.10)"
        icon={<Check size={20} />}
      />
    )
  }

  return (
    <div
      className="flex h-full flex-col items-center justify-center py-6"
      style={{ color: DEADLINE_STATES[state.state].color }}
    >
      <Spinner size={18} />
      <span className="mt-1 text-xs">{DEADLINE_STATES[state.state].text}</span>
      <span className="text-xl font-bold">{deadline}</span>
    </div>
  )
}

export default ProposalAlert
