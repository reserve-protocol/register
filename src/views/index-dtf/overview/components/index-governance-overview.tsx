import GovernanceIcon from '@/components/icons/Governance'
import TokenLogo from '@/components/token-logo'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAtomValue } from 'jotai'
import { ArrowRight } from 'lucide-react'
import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { InnerGovernanceInfo } from '../../settings/components/index-settings-governance'
import { useStakingVaultAPY } from '../hooks/use-staking-vault-apy'
import Staking from './staking'

const Container = ({ children }: { children: React.ReactNode }) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!dtf) return null

  return (
    <Card className="p-2 sm:p-4">
      <div className="flex items-center gap-2 mb-4 px-2 pt-2 justify-between">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <GovernanceIcon />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>View non-basket governance settings</span>
          <Link
            to={getFolioRoute(
              dtf.id,
              chainId,
              ROUTES.SETTINGS + '#non-basket-governance'
            )}
            className="p-1 bg-muted rounded-full"
          >
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold px-2">Basket Governance</h2>
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
  const apy = useStakingVaultAPY()

  if (!dtf) return

  return (
    <div
      ref={ref}
      className="flex items-center gap-2 rounded-xl hover:bg-primary/10 p-4 -m-4 mt-2"
      role="button"
      onClick={onClick}
    >
      <TokenLogo
        size="xl"
        symbol={dtf.stToken?.underlying?.symbol ?? ''}
        address={dtf.stToken?.underlying?.address ?? 'Unknown'}
        chain={chainId}
      />
      <h4 className="font-bold mr-auto text-primary">
        Lock ${dtf.stToken?.underlying.symbol ?? 'Unknown'} to Govern{' '}
        {Number(apy.toFixed(2)) > 0 && `& Earn ${apy.toFixed(2)}% APY`}
      </h4>
      <Box
        variant="circle"
        className="h-8 w-8 bg-primary dark:bg-primary text-primary-foreground"
      >
        <ArrowRight size={16} />
      </Box>
    </div>
  )
})

const ViewNonBasketGovernanceButton = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!dtf) return null

  return (
    <Link
      to={getFolioRoute(
        dtf.id,
        chainId,
        ROUTES.SETTINGS + '#non-basket-governance'
      )}
    >
      <Button variant="outline" asChild className="w-full rounded-lg">
        <div className="flex items-center gap-1.5">
          <span>View non-basket governance settings</span>
          <ArrowRight size={14} />
        </div>
      </Button>
    </Link>
  )
}

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
      <div className="p-2 pb-0">
        <p className="text-legend">
          ${dtf.token.symbol} is governed by the $
          {dtf.stToken?.underlying?.symbol} token.{' '}
          {dtf.stToken?.underlying?.symbol} holders must vote-lock their tokens
          to become a governor of the ${dtf.token.symbol}. Governors can propose
          changes to the basket and vote on proposal by other governors. In
          exchange for locking their tokens and participating in governance,
          governors earn a portion of the TVL fee charged by the DTF.
        </p>
        {account ? (
          <Staking>
            <OpenLockDrawerButton />
          </Staking>
        ) : (
          <OpenLockDrawerButton onClick={openConnectModal} />
        )}
      </div>
      <Separator className="my-6" />
      <InnerGovernanceInfo kind="trading" className="[&>*]:px-0 px-2 -mt-3" />
      <ViewNonBasketGovernanceButton />
    </Container>
  )
}

export default IndexGovernanceOverview
