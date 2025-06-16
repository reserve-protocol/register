import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getProposalTitle } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { currentProposalIdAtom, currentRebalanceAtom } from '../../atoms'
import RebalanceAction from './components/rebalance-action'
import RebalanceSetup from './components/rebalance-setup'
import Updater from './updater'
import RebalanceAuctions from './components/rebalance-auctions'
import { useTransactionReceipt } from 'wagmi'

const RebalanceHeader = () => {
  const rebalance = useAtomValue(currentRebalanceAtom)

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Link to={`../`}>
        <Button variant="muted" size="icon-rounded">
          <ArrowLeft />
        </Button>
      </Link>
      <div>
        <h4 className="text-legend text-sm">Rebalance proposal</h4>
        {!!rebalance ? (
          <Link
            to={`/proposal/${rebalance?.proposal.id}`}
            className="underline"
          >
            {getProposalTitle(rebalance.proposal.description)}
          </Link>
        ) : (
          <Skeleton className="w-24 h-6" />
        )}
      </div>
    </div>
  )
}

const Rebalance = () => {
  const { proposalId } = useParams()
  const setCurrentProposalId = useSetAtom(currentProposalIdAtom)
  const result = useTransactionReceipt({
    hash: '0x59418defdaea6afdfd24447c4e1c64b55608c0b0f7feb408e60db6d721af10eb',
  })
  console.log(
    'RESULT',
    JSON.stringify(
      result,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2
    )
  )
  useEffect(() => {
    if (proposalId) {
      setCurrentProposalId(proposalId)
    }

    return () => {
      setCurrentProposalId('')
    }
  }, [proposalId])

  return (
    <>
      <div className="bg-secondary p-1 rounded-4xl w-[480px] flex flex-col gap-1">
        <div className="bg-background/70  rounded-3xl">
          <RebalanceHeader />
          <RebalanceSetup />
        </div>
        <RebalanceAction />
        <RebalanceAuctions />
      </div>
      <Updater />
    </>
  )
}

export default Rebalance
