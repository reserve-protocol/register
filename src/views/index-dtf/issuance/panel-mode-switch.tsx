import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowLeftRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { panelModeAtom } from './atoms'

// Subtle top-right link under the issuance panel. From the automated mint
// wizard it switches back to the zapper swap; from the swap it links to the
// manual mint page.
const PanelModeSwitch = () => {
  const [mode, setMode] = useAtom(panelModeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (mode === 'auto') {
    return (
      <button
        type="button"
        onClick={() => setMode('swap')}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ArrowLeftRight size={15} />
        <Trans>Use Swap</Trans>
      </button>
    )
  }

  if (!dtf) return null

  return (
    <Link
      to={getFolioRoute(dtf.id, chainId, `${ROUTES.ISSUANCE}/manual`)}
      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
    >
      <Trans>Switch to Manual Mint</Trans>
    </Link>
  )
}

export default PanelModeSwitch
