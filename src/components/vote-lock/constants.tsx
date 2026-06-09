import { LockKeyhole, LockKeyholeOpen, UsersRound } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import type { VoteLockTab } from './atoms'

export const VOTE_LOCK_TABS = [
  {
    key: 'lock',
    label: <Trans>Vote-lock</Trans>,
    icon: <LockKeyhole size={16} />,
  },
  {
    key: 'unlock',
    label: <Trans>Unlock</Trans>,
    icon: <LockKeyholeOpen size={16} />,
  },
  {
    key: 'delegate',
    label: <Trans>Delegate</Trans>,
    icon: <UsersRound size={16} />,
  },
] as const satisfies readonly {
  key: VoteLockTab
  label: JSX.Element
  icon: JSX.Element
}[]
