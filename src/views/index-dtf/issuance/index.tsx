import { devModeAtom } from '@/state/atoms'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { indexDTFAtom, indexDTFStatusAtom } from '@/state/dtf/atoms'
import { RESERVE_API, ZAPPER_API } from '@/utils/constants'
import { useZapperModal, ZapperProps } from '@reserve-protocol/react-zapper'
import { atom, useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import ZapperWrapper from '../components/zapper/zapper-wrapper'
import useTrackIndexDTFPage, {
  useTrackIndexDTFClick,
} from '../hooks/useTrackIndexDTFPage'
import useIsComplianceRestricted from '@/hooks/use-is-compliance-restricted'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'
import { Trans } from '@lingui/macro'

const DTF_DISABLED_FOR_ZAP = [] as string[]
export const indexDTFQuoteSourceAtom = atom<ZapperProps['defaultSource']>(
  (get) => {
    // const dtf = get(indexDTFAtom)
    // if (dtf?.id && DTF_DISABLED_FOR_ZAP.includes(dtf?.id.toLowerCase())) {
    //   return 'odos'†
    // }
    // return 'best'
    return 'best'
  }
)

const ComplianceAlert = () => {
  const { isLoading, data } = useComplianceRestrictions()

  if (isLoading || !data?.restricted) return null

  return (
    <Alert
      variant="destructive"
      className="rounded-3xl mb-4 text-sm sm:w-[420px] mx-auto"
    >
      <AlertTitle>{data.title}</AlertTitle>
      <AlertDescription>
        {data.description}{' '}
        <Trans>
          For more information, see our{' '}
          <a
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://reserve.org/terms-and-conditions"
          >
            Terms of Use
          </a>
          .
        </Trans>
      </AlertDescription>
    </Alert>
  )
}

const IndexDTFIssuance = () => {
  useTrackIndexDTFPage('mint')
  const indexDTF = useAtomValue(indexDTFAtom)
  const quoteSource = useAtomValue(indexDTFQuoteSourceAtom)
  const devMode = useAtomValue(devModeAtom)
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))
  const { currentTab } = useZapperModal()
  const { trackClick } = useTrackIndexDTFClick('overview', 'mint')
  const isRestricted = useIsComplianceRestricted()

  if (!indexDTF) return null

  return (
    <div className="container">
      <div className="flex flex-col items-center justify-start sm:justify-center gap-2 lg:bg-secondary sm:min-h-[calc(100vh-136px)] lg:min-h-[calc(100vh-80px)] rounded-4xl lg:mr-2 ">
        <div className="flex flex-col w-fit rounded-4xl">
          <ComplianceAlert />
          <div className="bg-card rounded-3xl border-2 border-secondary sm:w-[420px] p-2 m-auto">
            <ZapperWrapper
              chain={indexDTF.chainId}
              dtfAddress={indexDTF.id}
              mode="inline"
              apiUrl={RESERVE_API}
              zapperApiUrl={ZAPPER_API}
              debug={devMode}
              defaultSource={quoteSource}
              sellOnly={isDeprecated}
              disabled={isRestricted}
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
    </div >
  )
}

export default IndexDTFIssuance
