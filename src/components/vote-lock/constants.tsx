import { LockKeyhole, LockKeyholeOpen, UsersRound } from 'lucide-react'
import type { VoteLockTab } from './atoms'

export const VOTE_LOCK_TABS = [
  {
    key: 'lock',
    label: 'Vote-lock',
    icon: <LockKeyhole size={16} />,
  },
  {
    key: 'unlock',
    label: 'Unlock',
    icon: <LockKeyholeOpen size={16} />,
  },
  {
    key: 'delegate',
    label: 'Delegate',
    icon: <UsersRound size={16} />,
  },
] as const satisfies readonly {
  key: VoteLockTab
  label: string
  icon: JSX.Element
}[]
