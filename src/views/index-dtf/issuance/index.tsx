import { indexDTFAtom } from '@/state/dtf/atoms'
import { useZapperModal, Zapper } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import useTrackIndexDTFPage, {
  useTrackIndexDTFClick,
} from '../hooks/useTrackIndexDTFPage'
import { wagmiConfig } from '@/state/chain'

const IndexDTFIssuance = () => {
  useTrackIndexDTFPage('mint')
  const indexDTF = useAtomValue(indexDTFAtom)
  const { currentTab } = useZapperModal()

  const { trackClick } = useTrackIndexDTFClick('overview', 'mint')

  if (!indexDTF) return null

  return (
    <div className="container flex flex-col items-center sm:justify-start md:justify-center gap-2 lg:bg-secondary lg:h-[calc(100vh-100px)] dark:bg-card rounded-4xl w-full">
      <div className="flex flex-col w-fit rounded-4xl p-1 ">
        <div className="bg-card rounded-3xl border-2 border-secondary sm:w-[420px] p-2 m-auto">
          <Zapper
            wagmiConfig={wagmiConfig}
            chain={indexDTF.chainId}
            dtfAddress={indexDTF.id}
            mode="inline"
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
  )
}

export default IndexDTFIssuance
