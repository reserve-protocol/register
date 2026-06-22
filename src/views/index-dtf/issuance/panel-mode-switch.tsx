import { Trans } from '@lingui/react/macro'
import { useAtom } from 'jotai'
import { ArrowLeftRight } from 'lucide-react'
import { panelModeAtom } from './atoms'

// Subtle top-right link that switches the issuance page between the zapper swap
// and the automated mint wizard. Swap is the default landing; from there it
// points to "Automated Mint", and from the wizard it points back to "Use Swap".
const PanelModeSwitch = () => {
  const [mode, setMode] = useAtom(panelModeAtom)

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

  return (
    <button
      type="button"
      onClick={() => setMode('auto')}
      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
    >
      <Trans>Try Automated Mint</Trans>
    </button>
  )
}

export default PanelModeSwitch
