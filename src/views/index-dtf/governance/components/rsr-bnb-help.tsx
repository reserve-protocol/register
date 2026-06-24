import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'

const RSRBNBHelp = ({ className }: { className?: string }) => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)

  if (chainId !== ChainId.BSC) return null

  return (
    <Link
      className={cn(
        'flex flex-col justify-start items-start gap-2 w-full',
        className
      )}
      target="_blank"
      href="https://x.com/reserveprotocol/status/1991311026974036379?s=46&t=PSRhUIOkR4MrrAAJE14IIw"
    >
      <div className="flex items-end gap-2 text-sm w-full">
        <div className="flex flex-col gap-1 mr-auto max-w-80">
          <h2 className="font-semibold text-sm">
            <Trans>Need to bridge your RSR?</Trans>
          </h2>
          <p className="text-xs text-legend">
            <Trans>
              ${indexDTF?.token.symbol ?? 'This DTF'} is on BSC and you need to
              bridge your RSR using Wormhole to participate in governance.
            </Trans>
          </p>
        </div>
        <Button variant="muted" size="icon-rounded">
          <ArrowUpRightIcon size={16} />
        </Button>
      </div>
    </Link>
  )
}

export default RSRBNBHelp
