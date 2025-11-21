import useTokenList from '@/hooks/useTokenList'
import Header from './components/header'
import { useSetAtom } from 'jotai'
import { yieldDTFListAtom } from './atoms'
import { useEffect } from 'react'
import StakingPositions from './components/staking-positions'

const Updater = () => {
  const { list } = useTokenList()
  const setYieldDTFList = useSetAtom(yieldDTFListAtom)

  useEffect(() => {
    if (list) {
      setYieldDTFList(list)
    }
  }, [list, setYieldDTFList])

  return null
}

const EarnYieldDTF = () => {
  return (
    <div>
      <Header />
      <Updater />
      <StakingPositions />
    </div>
  )
}

export default EarnYieldDTF
