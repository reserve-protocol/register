import useIndexDTFList from '@/hooks/useIndexDTFList'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { indexDTFListAtom, voteLockPositionsAtom } from './atoms'
import IndexDTFEarnFaq from './components/faq'
import Header from './components/header'
import VoteLockPositions from './components/vote-lock-positions'
import useVoteLockPositions from './hooks/use-vote-lock-positions'

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

const EarnIndexDTF = () => (
  <div data-testid="earn-index-dtf">
    <Header />
    <VoteLockPositions />
    <IndexDTFEarnFaq />
    <Updater />
  </div>
)

export default EarnIndexDTF
