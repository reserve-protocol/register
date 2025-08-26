import { wagmiConfig } from '@/state/chain'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import ZapperWrapper from '../components/zapper/zapper-wrapper'
import useTrackIndexDTFPage, {
  useTrackIndexDTFClick,
} from '../hooks/useTrackIndexDTFPage'
import { RESERVE_API } from '@/utils/constants'

const IndexDTFIssuance = () => {
  useTrackIndexDTFPage('mint')
  const indexDTF = useAtomValue(indexDTFAtom)
  const { currentTab } = useZapperModal()
  const { trackClick } = useTrackIndexDTFClick('overview', 'mint')

  if (!indexDTF) return null

  return (
    <div className="container">
      <div className="flex flex-col items-center justify-start sm:justify-center gap-2 lg:bg-secondary sm:min-h-[calc(100vh-136px)] lg:min-h-[calc(100vh-80px)] rounded-4xl lg:mr-2 ">
        <div className="flex flex-col w-fit rounded-4xl">
          <div className="bg-card rounded-3xl border-2 border-secondary sm:w-[420px] p-2 m-auto">
            <ZapperWrapper
              wagmiConfig={wagmiConfig}
              chain={indexDTF.chainId}
              dtfAddress={indexDTF.id}
              mode="inline"
              apiUrl={RESERVE_API}
            />
          </div>
        </div>
        <div className="w-full mt-4 sm:w-[420px] flex justify-center ">
          <Link
            to={`./manual`}
            className="mx-auto"
            onClick={() => trackClick('switch_to_manual')}
          >
            <span className="text-legend underline text-md ">
              Having issues? Switch to manual{' '}
              {currentTab === 'buy' ? 'minting' : 'redeeming'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default IndexDTFIssuance
