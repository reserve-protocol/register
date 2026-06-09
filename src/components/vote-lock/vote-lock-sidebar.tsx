import { useAtom, useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { portfolioStTokenAtom, stakingSidebarOpenAtom } from './atoms'
import { ExternalVoteLockDrawer } from './external-vote-lock-drawer'

export const VoteLockSidebar = () => {
  const [sidebar, setSidebar] = useAtom(stakingSidebarOpenAtom)
  const stToken = useAtomValue(portfolioStTokenAtom)
  const resetStToken = useResetAtom(portfolioStTokenAtom)
  const resetSidebar = useResetAtom(stakingSidebarOpenAtom)

  const closeSidebar = () => {
    resetStToken()
    resetSidebar()
  }

  if (!stToken) return null

  return (
    <ExternalVoteLockDrawer
      stToken={stToken}
      dtfAddress={stToken.dtfAddress}
      initialTab={sidebar.tab ?? 'lock'}
      open={sidebar.open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setSidebar({ open: true, tab: sidebar.tab })
          return
        }

        closeSidebar()
      }}
      onClose={closeSidebar}
    />
  )
}
