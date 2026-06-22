import { devModeAtom } from '@/state/atoms'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { indexDTFAtom, indexDTFStatusAtom } from '@/state/dtf/atoms'
import { RESERVE_API, ZAPPER_API } from '@/utils/constants'
import { ZapperProps } from '@reserve-protocol/react-zapper'
import { atom, useAtomValue } from 'jotai'
import ComplianceAlert from '../components/compliance-alert'
import ZapperWrapper from '../components/zapper/zapper-wrapper'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import useIsComplianceRestricted from '@/hooks/use-is-compliance-restricted'
import AsyncMint from './async-mint'
import { wizardStepAtom } from './async-mint/atoms'
import { panelModeAtom } from './atoms'
import PanelModeSwitch from './panel-mode-switch'

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

const IndexDTFIssuance = () => {
  useTrackIndexDTFPage('mint')
  const indexDTF = useAtomValue(indexDTFAtom)
  const quoteSource = useAtomValue(indexDTFQuoteSourceAtom)
  const devMode = useAtomValue(devModeAtom)
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))
  const isRestricted = useIsComplianceRestricted()
  const panelMode = useAtomValue(panelModeAtom)
  const wizardStep = useAtomValue(wizardStepAtom)

  // Show the switch link on swap, and on the auto config step — but not on the
  // gnosis gate (it has its own "Use Swap"), nor once the wizard is running
  // (quote/execution) so the user can't bail mid-flow.
  const showModeSwitch = panelMode === 'swap' || wizardStep === 'configure'

  if (!indexDTF) return null

  return (
    <div className="container">
      <div className="flex flex-col items-center justify-center gap-4 lg:bg-secondary sm:min-h-[calc(100vh-136px)] lg:min-h-[calc(100vh-80px)] rounded-4xl lg:mr-2 ">
        {panelMode === 'auto' ? (
          <AsyncMint embedded />
        ) : (
          <div className="relative flex w-full flex-col items-center gap-3 rounded-4xl sm:w-[420px] lg:gap-3">
            <ComplianceAlert />
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
                disabled={isRestricted}
              />
            </div>
          </div>
        )}
        {/* Centered switch link, 40px (gap-6) below the panel. Hidden once the
            wizard is running so the user can't bail mid-flow. */}
        {showModeSwitch && <PanelModeSwitch />}
      </div>
    </div>
  )
}

export default IndexDTFIssuance
