import useIndexDTFList from '@/hooks/useIndexDTFList'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { indexDTFListAtom, voteLockPositionsAtom } from './atoms'
import Header from './components/header'
import VoteLockPositions from './components/vote-lock-positions'
import useVoteLockPositions from './hooks/use-vote-lock-positions'
import EarnFAQ from '../../components/earn-faq'

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: 'What is vote-locking?',
    answer: (
      <div className="flex flex-col gap-1">
        <p>
          Vote locking is the process of locking an ERC20 token for a set period
          to gain governance power of an Index DTF and earn rewards. While
          locked, the RSR cannot be transferred or sold until the lock period
          ends.
        </p>
        <p>
          Vote lockers govern the key parameters of an Index DTF, including
          which assets are in the basket, their weights, fees, and contract
          upgrades.
        </p>
        <p>
          Vote lockers earn rewards from the DTF’s fees. A portion of the TVL
          fees and mint fees collected by the Index DTF are distributed to
          vote-locked token holders. The more tokens locked, the larger the
          share of rewards an individual vote-locked token holder will receive.
        </p>
      </div>
    ),
  },
  {
    question: 'Do I need to vote on proposals to earn rewards?',
    answer:
      'No. You earn rewards as long as your ERC2O tokens are vote-locked, even if you don’t participate in every proposal. Voting is encouraged, but it’s not required to receive your share of rewards.',
  },
  {
    question: 'Can I unlock my tokens anytime?',
    answer:
      'No. Locked RSR follows the DTF’s timelock rules, which are set when the DTF is created. You should always check the lock duration before committing, as early unlocks are not allowed. This prevents short-term manipulation and keeps governance aligned with long-term holders.',
  },
]

const Updater = () => {
  const { data: voteLockData } = useVoteLockPositions()
  const { data: dtfListData } = useIndexDTFList()
  const setVoteLockPositions = useSetAtom(voteLockPositionsAtom)
  const setIndexDTFList = useSetAtom(indexDTFListAtom)

  useEffect(() => {
    if (voteLockData) {
      setVoteLockPositions(voteLockData)
    }
  }, [voteLockData, setVoteLockPositions])

  useEffect(() => {
    if (dtfListData) {
      setIndexDTFList(dtfListData)
    }
  }, [dtfListData, setIndexDTFList])

  return null
}

const EarnIndexDTF = () => {
  return (
    <>
      <Header />
      <VoteLockPositions />
      <EarnFAQ title="Vote Lock Frequently Asked Questions" faqs={faqs} />
      <Updater />
    </>
  )
}

export default EarnIndexDTF
