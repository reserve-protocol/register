import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowLeftRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { operationAtom } from '../atoms'
import { useTrackAsyncZap } from '../hooks/use-track-async-zap'

// Standalone /issuance/automated has no other path to the manual flow, so offer
// it below the wizard card. Absolute route (a relative ".." would resolve to the
// DTF overview), mirroring the manual page's reciprocal "switch to zap".
const SwitchToManualLink = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const operation = useAtomValue(operationAtom)
  const { track } = useTrackAsyncZap()

  if (!indexDTF) return null

  const manualRoute = getFolioRoute(
    indexDTF.id,
    chainId,
    `${ROUTES.ISSUANCE}/manual`
  )

  return (
    <Link
      to={manualRoute}
      onClick={() => track('switch_to_manual')}
      className="mt-4 inline-flex items-center gap-1.5 self-center text-sm text-primary hover:underline"
    >
      <ArrowLeftRight size={15} />
      {operation === 'redeem' ? (
        <Trans>Switch to manual redeeming</Trans>
      ) : (
        <Trans>Switch to manual minting</Trans>
      )}
    </Link>
  )
}

export default SwitchToManualLink
