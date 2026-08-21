import TokenLogo from '@/components/token-logo'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import DTFSwitcher from '@/views/index-dtf/components/dtf-switcher'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ChevronsUpDown } from 'lucide-react'

// Lets the user swap into another DTF without leaving the trade surface — the
// widget's own token row lives in react-zapper and can't host this
const IssuanceDTFSwitcher = () => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)

  if (!dtf) return null

  return (
    <DTFSwitcher align="center" className="w-[320px]">
      <button
        type="button"
        data-testid="dtf-switcher-trigger-issuance"
        aria-label={t`Switch DTF`}
        className="flex min-h-11 w-full items-center gap-2 rounded-3xl border-2 border-secondary bg-card px-3 py-2 text-left transition-colors hover:border-primary/40 sm:w-[420px]"
      >
        <TokenLogo
          src={brand?.dtf?.icon || undefined}
          symbol={dtf.token.symbol}
          address={dtf.id}
          chain={dtf.chainId}
          size="lg"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            ${dtf.token.symbol}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {dtf.token.name}
          </div>
        </div>
        <ChevronsUpDown
          strokeWidth={1.5}
          size={16}
          className="shrink-0 text-muted-foreground"
        />
      </button>
    </DTFSwitcher>
  )
}

export default IssuanceDTFSwitcher
