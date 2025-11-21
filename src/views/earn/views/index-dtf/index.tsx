import { useEffect } from 'react'
import Header from './components/header'
import VoteLockPositions from './components/vote-lock-positions'
import useVoteLockPositions from './hooks/use-vote-lock-positions'
import useIndexDTFList from '@/hooks/useIndexDTFList'
import { voteLockPositionsAtom, indexDTFListAtom } from './atoms'
import { useSetAtom } from 'jotai'

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
      <Updater />
    </>
  )
}

export default EarnIndexDTF
