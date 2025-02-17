import GovernanceIcon from '@/components/icons/Governance'
import TokenLogo from '@/components/token-logo'
import { Box } from '@/components/ui/box'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowRight, Asterisk, Check } from 'lucide-react'
import Staking from './staking'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { forwardRef } from 'react'

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <GovernanceIcon />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2">Governance</h2>
        {children}
      </div>
    </Card>
  )
}

const OpenLockDrawerButton = forwardRef<
  HTMLDivElement,
  { onClick?: () => void }
>(({ onClick }, ref) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!dtf) return

  return (
    <div
      ref={ref}
      className="flex items-center gap-2 rounded-xl hover:bg-primary/10 p-4 -m-4 mt-2"
      role="button"
      onClick={() => onClick?.()}
    >
      <TokenLogo
        size="xl"
        symbol={dtf.stToken?.underlying.symbol}
        address={dtf.stToken?.underlying.address ?? 'Unknown'}
        chain={chainId}
      />
      <h4 className="font-bold mr-auto text-primary">
        Lock ${dtf.stToken?.underlying.symbol ?? 'Unknown'} to to Govern & Earn
      </h4>
      <Box
        variant="circle"
        className="h-8 w-8 bg-primary text-primary-foreground"
      >
        <ArrowRight size={16} />
      </Box>
    </div>
  )
})

const IndexGovernanceOverview = () => {
  const account = useAtomValue(walletAtom)
  const { openConnectModal } = useConnectModal()
  const dtf = useAtomValue(indexDTFAtom)

  if (!dtf) {
    return (
      <Container>
        <Skeleton className="w-full h-80 rounded-3xl" />
      </Container>
    )
  }

  return (
    <Container>
      <p className="text-legend">
        ${dtf.token.symbol} is governed by the ${dtf.stToken?.underlying.symbol}{' '}
        token. {dtf.stToken?.underlying.symbol} holders must vote-lock their
        tokens to become a governor of the ${dtf.token.symbol}. Governors can
        propose changes to the basket and vote on proposal by other governors.
        In exchange for locking their tokens and participating in governance,
        governors earn a portion of the TVL fee charged by the DTF.
      </p>
      {account ? (
        <Staking>
          <OpenLockDrawerButton />
        </Staking>
      ) : (
        <OpenLockDrawerButton onClick={openConnectModal} />
      )}
      <Separator className="my-6" />
      <h3 className="text-legend mr-auto mb-6">
        How changes to ${dtf?.token.symbol || 'DTF'} occur
      </h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="border border-foreground p-0.5 rounded-full">
            <Asterisk size={16} />
          </div>
          <span className="font-bold">
            ${dtf.stToken?.underlying.symbol} holders vote-lock their tokens to
            become a Governor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="border border-foreground p-0.5 rounded-full">
            <ArrowDown size={16} />
          </div>
          <span className="font-bold">
            A Governor proposes a change to the basket
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="border border-foreground p-0.5 rounded-full">
            <ArrowDown size={16} />
          </div>
          <span className="font-bold">
            Governors have to vote on the proposal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="border border-foreground p-0.5 rounded-full">
            <Check size={16} />
          </div>
          <span className="font-bold">
            If the proposal passes, its change(s) are executed onchain
          </span>
        </div>
      </div>
    </Container>
  )
}

export default IndexGovernanceOverview
