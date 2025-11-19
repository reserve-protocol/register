import { useEffect } from 'react'
import Header from './components/header'
import VoteLockPositions from './components/vote-lock-positions'
import useVoteLockPositions from './hooks/use-vote-lock-positions'
import { voteLockPositionsAtom } from './atoms'
import { useSetAtom } from 'jotai'

const Updater = () => {
  const { data } = useVoteLockPositions()
  const setVoteLockPositions = useSetAtom(voteLockPositionsAtom)

  useEffect(() => {
    if (data) {
      setVoteLockPositions(data)
    }
  }, [data])

  return null
}

const EarnIndexDTF = () => {
  return (
    <div>
      <Header />
      <VoteLockPositions />
      <Updater />
    </div>
  )
}

export default EarnIndexDTF
