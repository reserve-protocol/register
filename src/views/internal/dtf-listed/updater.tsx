import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useIndexDTFList from '@/hooks/useIndexDTFList'
import useListedDTFGovernance from './hooks/use-listed-dtf-governance'
import { isLoadingAtom, listedDTFsAtom } from './atoms'

const Updater = () => {
  const { data: dtfList, isLoading: isListLoading } = useIndexDTFList()
  const { data: governanceData, isLoading: isGovLoading } =
    useListedDTFGovernance(dtfList)

  const setListedDTFs = useSetAtom(listedDTFsAtom)
  const setIsLoading = useSetAtom(isLoadingAtom)

  useEffect(() => {
    setIsLoading(isListLoading || isGovLoading)
  }, [isListLoading, isGovLoading, setIsLoading])

  useEffect(() => {
    if (governanceData) {
      setListedDTFs(governanceData)
    }
  }, [governanceData, setListedDTFs])

  return null
}

export default Updater
