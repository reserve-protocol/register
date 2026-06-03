import { devModeAtom } from '@/state/atoms'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { indexDTFAtom, indexDTFStatusAtom } from '@/state/dtf/atoms'
import { RESERVE_API, ZAPPER_API } from '@/utils/constants'
import { ZapperProps } from '@reserve-protocol/react-zapper'
import { atom, useAtomValue } from 'jotai'
import ZapperWrapper from '../components/zapper/zapper-wrapper'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'

const DTF_DISABLED_FOR_ZAP = [] as string[]

export const indexDTFQuoteSourceAtom = atom<ZapperProps['defaultSource']>(
  (get) => {
    // const dtf = get(indexDTFAtom)
    // if (dtf?.id && DTF_DISABLED_FOR_ZAP.includes(dtf?.id.toLowerCase())) {
    //   return 'odos'
    // }
    // return 'best'
    return 'best'
  }
)

const IndexDTFIssuance = () => {
  useTrackIndexDTFPage('mint')
  const indexDTF = useAtomValue(indexDTFAtom)
  const quoteSource = useAtomValue(indexDTFQuoteSourceAtom)
  const devMode = useAtomValue(devModeAtom)
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))

  if (!indexDTF) return null

  return (
    <div className="container">
      <div className="flex flex-col items-center justify-start sm:justify-center gap-2 lg:bg-secondary sm:min-h-[calc(100vh-136px)] lg:min-h-[calc(100vh-80px)] rounded-4xl lg:mr-2 ">
        <div className="relative flex w-full flex-col items-center gap-3 rounded-4xl sm:w-[420px] lg:gap-0">
          <div className="w-full rounded-3xl border-2 border-secondary bg-card p-2 sm:w-[420px]">
            <ZapperWrapper
              chain={indexDTF.chainId}
              dtfAddress={indexDTF.id}
              mode="inline"
              apiUrl={RESERVE_API}
              zapperApiUrl={ZAPPER_API}
              debug={devMode}
              defaultSource={quoteSource}
              sellOnly={isDeprecated}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexDTFIssuance
