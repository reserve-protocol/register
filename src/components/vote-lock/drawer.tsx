import { ReactNode } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { StTokenExtended, VoteLockDrawerState, VoteLockTab } from './atoms'
import { VOTE_LOCK_TABS } from './constants'
import DelegateView from './components/delegate'
import VoteLockDrawerFooter from './components/drawer-footer'
import VoteLock from './components/vote-lock'
import VoteUnlock from './components/vote-unlock'
import { useVoteLockDrawer } from './hooks/use-vote-lock-drawer'

export interface VoteLockDrawerProps {
  stToken: StTokenExtended
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  initialTab?: VoteLockTab
  children?: ReactNode
}

type VoteLockDrawerInnerProps = VoteLockDrawerProps & {
  voteLockState?: VoteLockDrawerState
  isOptimisticGovernance?: boolean
  onRefresh?: () => void
}

export const VoteLockDrawer = ({
  stToken,
  voteLockState,
  isOptimisticGovernance = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onClose,
  initialTab,
  onRefresh,
  children,
}: VoteLockDrawerInnerProps) => {
  const { currentTab, open, handleOpenChange, handleTabChange } =
    useVoteLockDrawer({
      stToken,
      voteLockState,
      initialTab,
      controlledOpen,
      controlledOnOpenChange,
      onClose,
    })

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {!!children && (
        <DrawerTrigger asChild onClick={() => handleOpenChange(true)}>
          {children}
        </DrawerTrigger>
      )}
      <DrawerContent>
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="flex flex-col"
        >
          <DrawerTitle className="flex gap-2 mt-2 px-2 mb-2">
            <TabsList className="h-9">
              {VOTE_LOCK_TABS.map(({ key, label, icon }) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex gap-1 items-center pl-2 pr-3 data-[state=active]:text-primary"
                >
                  {icon}
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </DrawerTitle>
          <TabsContent value="lock" className="h-full overflow-auto p-2 mt-0">
            <VoteLock />
          </TabsContent>
          <TabsContent value="unlock" className="overflow-auto p-2 mt-0">
            <VoteUnlock />
          </TabsContent>
          <TabsContent value="delegate" className="overflow-auto p-2 mt-0">
            <DelegateView isOptimisticGovernance={isOptimisticGovernance} />
          </TabsContent>
        </Tabs>
        <VoteLockDrawerFooter
          currentTab={currentTab}
          isOptimisticGovernance={isOptimisticGovernance}
          onRefresh={onRefresh}
        />
      </DrawerContent>
    </Drawer>
  )
}

export default VoteLockDrawer
